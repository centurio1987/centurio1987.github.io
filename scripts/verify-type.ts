#!/usr/bin/env bun
/**
 * verify-type — **선언한 글자 면이 실재하고, 도착하고, 그 글자를 실제로 그리는가.**
 *
 * 왜 필요한가.
 *   글자 축의 결함은 **빌드도 타입도 `tokens:verify` 도 전부 초록인 채로** 산다. 셋을 실측으로
 *   밟았다(KAN-080).
 *
 *   ① **없는 웨이트를 규정한 문서.** `DESIGN_CONCEPT.md` 는 h2·h3 를 「Gowun Dodum 700」이라
 *      적었는데 배포본에는 **400 한 종뿐**이었다. 화면의 굵기는 전부 브라우저 합성이었고,
 *      합성 볼드는 `getComputedStyle` 의 `font-weight` 가 **700 으로 같게 나와** `render:compare`
 *      도 못 본다. 100여 자리가 그렇게 서 있었다.
 *   ② **선언은 있는데 파일이 없는 상태.** 자체 호스팅으로 옮긴 뒤로는 `@font-face` 가 가리키는
 *      woff2 가 빠져도 브라우저가 조용히 폴백한다 — 아무 로그도 안 남는다.
 *   ③ **토큰을 완벽히 지켰는데 그 서체에 그 글자가 없는 자리.** `var(--font-mono)` 는 준수인데
 *      Space Mono 의 `unicode-range` 에 한글이 **0** 이라, 그 자리 한글은 설계가 고른 얼굴이
 *      아니라 **보는 사람 OS 가 고른 얼굴**로 그려졌다(지면 11곳에서 141조각 중 57조각이 한글).
 *      **토큰 게이트가 원리적으로 못 보는 종류다** — 값이 아니라 그 값이 가리키는 서체의 성질이다.
 *
 * 무엇을 보나 — 세 층이고 층마다 보는 것이 다르다.
 *   **1층 정적(CI 에 들어간다)** — 역할표(`src/lib/typeRoles.ts`)가 선언한 (얼굴, 굵기) 짝이
 *     실재하는가. 실재의 원천은 둘이다: 자체 호스팅 `@font-face`(+ woff2 파일 실재)와
 *     구글 URL 의 `wght`. 그리고 **같은 집합을 드는 선언 다섯 곳이 안 갈렸는가** — 갈리면
 *     같은 그림이 지면과 래스터에서 다른 얼굴로 나오고, hero 는 굽고 나면 굳는다.
 *   **2층 런타임(CI 밖)** — 선언한 면이 실제로 **도착**하는가. 1층은 선언을 보고 2층은 도착을
 *     본다: 파일이 404 이거나 `unicode-range` 가 어긋나면 1층은 초록인 채로 화면만 폴백이다.
 *   **3층 덮개(CI 밖)** — 렌더된 텍스트마다 그 코드포인트를 그릴 면이 스택 안에 있는가.
 *     ③의 그물이다. 스택 끝의 generic 계열(`monospace`·`sans-serif`…)에 닿으면 위반으로 낸다 —
 *     그것이 곧 「설계가 고른 얼굴이 아니다」이기 때문이다.
 *
 * 왜 2·3층이 CI 밖인가.
 *   Playwright 가 필요한데 이 레포 CI 에 Playwright 게이트가 **0건**이다(`deco:verify` ·
 *   `width:verify` · `render:compare` 셋 다 로컬 전용). 없는 관례를 이 카드에서 세우지 않는다.
 *
 * 사용:
 *   bun run type:verify                # 세 층 전부 (dist/ 를 스스로 띄운다)
 *   bun run type:verify -- --static    # 1층만 — CI 가 쓰는 모드
 *   bun run type:verify -- --base http://localhost:4323   # 이미 띄운 서버로
 *   bun run type:verify -- --self-test # 고장 주입만 (이 레포는 검사 안 한다)
 *   bun run type:verify -- --no-self-test  # 자가검사를 건너뛴다(디버깅용)
 *
 * `verify-widths`·`verify-deco` 와 같은 이유로 **떠 있는 서버에 알아서 붙지 않는다** — 4321 은
 * 같은 레포의 다른 워크트리가 잡고 있기 쉽고, 그러면 남의 코드를 검사해 이 브랜치의 판정으로
 * 보고한다. `freePort()` 로 빈 포트를 잡아 `dist/` 를 띄운다.
 *
 * **판정은 마지막 줄과 종료코드 둘 다로 한다**(KAN-078). 층을 실제로 안 돈 실행의 마지막 줄에는
 * 「대조 안 함」이 박힌다 — 자가검사만 돌린 실행이 「통과」로 읽히면 게이트가 조용히 죽는다.
 *
 * 문제가 있으면 종료코드 1.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import { TYPE_ROLES, SELF_HOSTED, GENERIC_FAMILIES, requiredFaces, type TypeRole } from "../src/lib/typeRoles.ts";

const ROOT = process.cwd();
const argv = process.argv.slice(2);
const args = new Set(argv);
const STATIC_ONLY = args.has("--static");
const SELF_TEST_ONLY = args.has("--self-test");
const NO_SELF_TEST = args.has("--no-self-test");
const baseArg = argv.indexOf("--base") >= 0 ? argv[argv.indexOf("--base") + 1] : undefined;

/** 1층이 읽는 소스 전부. 순수 함수의 입력이라 자가검사가 파일 없이 고장을 주입한다. */
type Sources = {
  fontsCss: string;
  baseLayout: string;
  tokensCss: string;
  renderViz: string;
  vizGuide: string;
  /** `public/` 기준 경로 집합 — `/fonts/gowun-dodum-400.woff2` 꼴. */
  publicFiles: Set<string>;
};

const SRC = {
  fontsCss: "src/styles/fonts.css",
  baseLayout: "src/layouts/BaseLayout.astro",
  tokensCss: "src/styles/tokens.css",
  renderViz: "scripts/render-viz.ts",
  vizGuide: "src/lib/viz/blogVizStyleGuide.ts",
} as const;

/* ─────────────────────── 파서 — 선언에서 사실을 뽑는다 ─────────────────────── */

/**
 * 구글 Fonts CSS2 URL → (패밀리 → 굵기 집합).
 *
 * **`wght` 가 없으면 400 이다.** URL 에 안 붙인 것이 실수가 아니라 **붙일 값이 없어서**인
 * 경우가 있다(Jua·Gowun Dodum 이 그랬다) — 그것을 「굵기 미지정」으로 읽으면 없는 웨이트가
 * 검사를 통과한다.
 */
export function parseGoogleUrl(url: string): Map<string, Set<number>> {
  const out = new Map<string, Set<number>>();
  for (const m of url.matchAll(/family=([^&'"]+)/g)) {
    const spec = decodeURIComponent(m[1]).replace(/\+/g, " ");
    const [family, axes] = spec.split(":");
    const weights = new Set<number>();
    const wght = axes?.match(/wght@([\d;,.\s]+)/);
    if (wght) {
      for (const w of wght[1].split(/[;,]/)) {
        const n = Number(w.trim());
        if (n) weights.add(n);
      }
    } else {
      weights.add(400);
    }
    const key = family.trim();
    const set = out.get(key) ?? new Set<number>();
    for (const w of weights) set.add(w);
    out.set(key, set);
  }
  return out;
}

type FontFaceDecl = { family: string; weight: number; src: string[] };

/** `@font-face` 블록 → 서술자. `src` 의 url 들을 그대로 들고 온다(파일 실재 검사용). */
export function parseFontFaces(css: string): FontFaceDecl[] {
  const out: FontFaceDecl[] = [];
  for (const m of css.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
    const body = m[1];
    const family = body.match(/font-family:\s*["']?([^;"']+)["']?\s*;/)?.[1]?.trim();
    const weight = Number(body.match(/font-weight:\s*(\d+)/)?.[1] ?? 400);
    const src = [...body.matchAll(/url\(\s*["']?([^)"']+)["']?\s*\)/g)].map((u) => u[1].trim());
    if (family) out.push({ family, weight, src });
  }
  return out;
}

/** `tokens.css` 의 `--font-*: <스택>;` → 토큰 → 패밀리 목록(따옴표를 벗긴다). */
export function parseFontStacks(css: string): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const m of css.matchAll(/(--font-[a-z-]+)\s*:\s*([^;]+);/g)) {
    const name = m[1];
    // 굵기·행간·자간 토큰은 스택이 아니다 — 값에 따옴표도 쉼표도 없다.
    if (/^--font-(weight|leading|track)-/.test(name)) continue;
    out.set(
      name,
      m[2]
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean),
    );
  }
  return out;
}

/* ─────────────────────── 1층 — 정적 대조 ─────────────────────── */

export type LayerResult = { failures: string[]; notes: string[] };

export function staticLayer(s: Sources, roles: TypeRole[] = TYPE_ROLES): LayerResult {
  const failures: string[] = [];
  const notes: string[] = [];

  // (A) 자체 호스팅 — @font-face 가 선언한 면과 그 파일이 실제로 있는가.
  const faces = parseFontFaces(s.fontsCss);
  const selfHosted = new Map<string, Set<number>>();
  for (const f of faces) {
    const set = selfHosted.get(f.family) ?? new Set<number>();
    set.add(f.weight);
    selfHosted.set(f.family, set);
    for (const u of f.src) {
      if (u.startsWith("http") || u.startsWith("data:")) continue;
      if (!s.publicFiles.has(u)) {
        failures.push(
          `@font-face ${f.family} ${f.weight} 이 없는 파일을 가리킨다 — ${u}. ` +
            "브라우저는 조용히 폴백하므로 화면만 보고는 못 잡는다 (`bun run build && bun run fonts:build`).",
        );
      }
    }
  }
  notes.push(
    `자체 호스팅 ${faces.length}면 — ` +
      [...selfHosted].map(([f, w]) => `${f} ${[...w].sort((a, b) => a - b).join("·")}`).join(" / "),
  );

  // (B) 구글 — BaseLayout 의 stylesheet URL.
  const googleUrl = s.baseLayout.match(/https:\/\/fonts\.googleapis\.com\/css2\?[^"'\s]+/)?.[0];
  if (!googleUrl) {
    failures.push(`${SRC.baseLayout} 에서 구글 Fonts URL 을 못 찾았다 — 배관이 바뀌었으면 이 게이트도 함께 고쳐라.`);
  }
  const google = googleUrl ? parseGoogleUrl(googleUrl) : new Map<string, Set<number>>();
  notes.push(
    `구글 ${google.size}패밀리 — ` +
      [...google].map(([f, w]) => `${f} ${[...w].sort((a, b) => a - b).join("·")}`).join(" / "),
  );

  // (C) 역할표가 요구하는 (얼굴, 굵기) 가 A∪B 안에 있는가 — 이 게이트의 중심 판정.
  const available = new Map<string, Set<number>>();
  for (const src of [selfHosted, google]) {
    for (const [f, ws] of src) {
      const set = available.get(f) ?? new Set<number>();
      for (const w of ws) set.add(w);
      available.set(f, set);
    }
  }
  for (const [family, want] of requiredFaces(roles)) {
    const have = available.get(family);
    if (!have) {
      failures.push(`역할표가 «${family}» 를 쓰는데 그 서체를 받는 선언이 없다 (@font-face 도, 구글 URL 도).`);
      continue;
    }
    const missing = [...want].filter((w) => !have.has(w)).sort((a, b) => a - b);
    if (missing.length) {
      failures.push(
        `«${family}» ${missing.join("·")} 이 실재하지 않는다 — 받는 것은 ${[...have].sort((a, b) => a - b).join("·")} 뿐이다. ` +
          "합성은 꺼져 있으므로(font-synthesis: style) 그 자리는 요청보다 가는 면으로 떨어진다.",
      );
    }
  }

  // (D) 토큰 스택이 역할표의 두 얼굴을 그 순서로 담는가.
  const stacks = parseFontStacks(s.tokensCss);
  for (const r of roles) {
    const stack = stacks.get(r.token);
    if (!stack) {
      failures.push(`${r.token} 이 ${SRC.tokensCss} 에 없다 — 역할표와 토큰이 갈렸다.`);
      continue;
    }
    const real = stack.filter((f) => !GENERIC_FAMILIES.has(f));
    if (real[0] !== r.latin) {
      failures.push(`${r.token} 의 첫 실제 패밀리가 «${real[0] ?? "(없음)"}» 인데 역할표는 «${r.latin}» 이라고 적는다.`);
    }
    if (!stack.includes(r.hangul)) {
      failures.push(
        `${r.token} 스택에 한글 얼굴 «${r.hangul}» 이 없다 — 그 자리 한글은 보는 사람 OS 가 고른 얼굴로 그려진다. ` +
          "스택 **끝에** 본문 서체를 놓아라(DESIGN_CONCEPT.md §5).",
      );
    }
  }
  notes.push(`토큰 스택 ${stacks.size}개 · 역할 ${roles.length}개 대조`);

  // (E) 래스터라이저가 같은 집합을 드는가 — 갈리면 hero 가 다른 얼굴로 굳는다.
  const vizUrl = s.renderViz.match(/https:\/\/fonts\.googleapis\.com\/css2\?[^"'\s)]+/)?.[0];
  if (!vizUrl) {
    failures.push(`${SRC.renderViz} 에서 구글 Fonts URL 을 못 찾았다.`);
  } else {
    const vg = parseGoogleUrl(vizUrl);
    for (const [f, ws] of google) {
      const mine = vg.get(f);
      const same = mine && [...ws].every((w) => mine.has(w)) && [...mine].every((w) => ws.has(w));
      if (!same) {
        failures.push(
          `래스터라이저의 서체 집합이 지면과 갈렸다 — «${f}» 지면 ${[...ws].sort((a, b) => a - b).join("·")} 대 ` +
            `래스터 ${mine ? [...mine].sort((a, b) => a - b).join("·") : "(없음)"}. hero 는 굽고 나면 굳어서 되돌릴 방법이 없다.`,
        );
      }
    }
    for (const f of vg.keys()) {
      if (!google.has(f)) failures.push(`래스터라이저에만 «${f}» 가 있다 — 지면에 없는 서체로 굽고 있다.`);
    }
  }
  const vizWeights = s.renderViz.match(/SELF_HOSTED_WEIGHTS\s*=\s*\[([^\]]+)\]/)?.[1];
  if (!vizWeights) {
    failures.push(`${SRC.renderViz} 에서 SELF_HOSTED_WEIGHTS 를 못 찾았다.`);
  } else {
    const got = new Set(
      vizWeights
        .split(",")
        .map((w) => Number(w.trim()))
        .filter(Boolean),
    );
    const want = selfHosted.get(SELF_HOSTED.family) ?? new Set<number>();
    const same = [...want].every((w) => got.has(w)) && [...got].every((w) => want.has(w));
    if (!same) {
      failures.push(
        `래스터라이저의 자체 호스팅 굵기가 @font-face 와 갈렸다 — ${SRC.fontsCss} ${[...want].sort((a, b) => a - b).join("·")} 대 ` +
          `SELF_HOSTED_WEIGHTS ${[...got].sort((a, b) => a - b).join("·")}.`,
      );
    }
  }

  // (F) viz 스타일 가이드가 토큰과 같은 값을 드는가.
  const pairs: [string, string][] = [
    ["titleFont", "--font-body"],
    ["monoFont", "--font-mono"],
  ];
  for (const [key, token] of pairs) {
    const got = s.vizGuide.match(new RegExp(`${key}:\\s*"([^"]+)"`))?.[1];
    if (!got) {
      failures.push(`${SRC.vizGuide} 에서 ${key} 를 못 찾았다.`);
      continue;
    }
    const want = stacks.get(token);
    if (!want) continue;
    const norm = (v: string) =>
      v
        .split(",")
        .map((x) => x.trim().replace(/^["']|["']$/g, ""))
        .join(",");
    if (norm(got) !== want.join(",")) {
      failures.push(`${SRC.vizGuide} 의 ${key} 가 ${token} 과 갈렸다 — «${norm(got)}» 대 «${want.join(",")}».`);
    }
  }

  return { failures, notes };
}

/* ─────────────────────── 자가검사 — 고장을 주입해 무는지 본다 ─────────────────────── */

type Fault = { name: string; break: (s: Sources) => Sources; expect: RegExp };

const FAULTS: Fault[] = [
  {
    name: "구운 700 면을 뺀다 (--font-body 가 원본 400 만 가리키게)",
    break: (s) => ({ ...s, fontsCss: s.fontsCss.replace(/@font-face\s*\{[^}]*font-weight:\s*700[^}]*\}/, "") }),
    expect: /«Gowun Dodum» 700 이 실재하지 않는다/,
  },
  {
    name: "@font-face 는 두고 woff2 파일만 없앤다",
    break: (s) => ({ ...s, publicFiles: new Set([...s.publicFiles].filter((f) => !f.includes("-500."))) }),
    expect: /없는 파일을 가리킨다/,
  },
  {
    name: "--font-mono 를 한글 얼굴 없이 되돌린다",
    break: (s) => ({
      ...s,
      tokensCss: s.tokensCss.replace(/--font-mono:[^;]+;/, "--font-mono: 'Space Mono', monospace;"),
    }),
    expect: /한글 얼굴 «Gowun Dodum» 이 없다/,
  },
  {
    name: "래스터라이저의 서체 집합을 갈라 놓는다",
    break: (s) => ({ ...s, renderViz: s.renderViz.replace(/family=Gaegu:wght@400;700&/, "") }),
    expect: /래스터라이저의 서체 집합이 지면과 갈렸다/,
  },
];

function selfTest(base: Sources): LayerResult {
  const failures: string[] = [];
  const notes: string[] = [];
  const clean = staticLayer(base);
  if (clean.failures.length) {
    // 지금 레포가 이미 빨간 것은 자가검사의 실패가 아니다 — 다만 아래 판정이 흐려지므로 말해 둔다.
    notes.push(`자가검사: 현재 소스에 이미 위반 ${clean.failures.length}건이 있다 — 고장 주입 판정은 사유로 가른다.`);
  }
  const seen = new Map<string, string>();
  for (const f of FAULTS) {
    const got = staticLayer(f.break(base)).failures;
    const hit = got.find((g) => f.expect.test(g) && !clean.failures.includes(g));
    if (!hit) {
      failures.push(`자가검사: «${f.name}» 를 못 잡았다 — 게이트가 그 갈래에서 죽어 있다.`);
      continue;
    }
    const dup = seen.get(hit);
    if (dup) failures.push(`자가검사: «${f.name}» 의 사유가 «${dup}» 와 같다 — 두 고장이 구분되지 않는다.`);
    seen.set(hit, f.name);
  }
  notes.push(`자가검사: 고장 ${FAULTS.length}종 주입 · 실패 ${failures.length}`);
  return { failures, notes };
}

/* ─────────────────────── 2·3층 — 렌더해서 본다 ─────────────────────── */

const ROUTES = ["/", "/posts", "/graph", "/404"];
const VIEWPORT = { width: 1440, height: 900 };

async function freePort(): Promise<number> {
  const net = await import("node:net");
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const addr = srv.address();
      const port = typeof addr === "object" && addr ? addr.port : 0;
      srv.close(() => (port ? resolve(port) : reject(new Error("빈 포트를 못 잡았다"))));
    });
  });
}

async function waitForServer(base: string, timeoutMs = 60_000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(base, { signal: AbortSignal.timeout(2000) });
      if (r.ok || r.status === 404) return true;
    } catch {
      /* 아직 안 떴다 */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function firstPostRoute(base: string): Promise<string | null> {
  try {
    const r = await fetch(`${base}/rss.xml`, { signal: AbortSignal.timeout(5000) });
    if (!r.ok) return null;
    const m = (await r.text()).match(/<link>[^<]*?(\/posts\/[^<]+?)\/?<\/link>/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

type Finding = {
  family: string;
  weight: number;
  stack: string;
  sample: string;
  tag: string;
  char: string;
  cp: string;
};

type ProbeResult = {
  /** [2층] 그 자리가 요청한 굵기의 면이 아예 없다 — 합성이 꺼져 있어 다른 면으로 떨어진다. */
  noFace: Finding[];
  /** [2층] 면은 선언돼 있는데 도착을 안 했다 — 화면은 폴백이다. */
  notArrived: Finding[];
  /** [3층] 그 코드포인트를 그릴 면이 스택 안에 하나도 없다. */
  uncovered: Finding[];
  nodes: number;
  faces: number;
};

/**
 * 브라우저 안에서 도는 코드. 2·3층을 한 번의 `evaluate` 로 함께 잰다 — 같은 입력
 * (등록된 `@font-face` 표 · 렌더된 텍스트)을 두 번 모으지 않기 위해서다.
 *
 * **두 층 다 「렌더된 텍스트」에서 출발한다.** 역할표를 훑어 `document.fonts.check` 를 부르는
 * 소박한 2층은 **전부 오탐이다**(실측 8건 전건) — 브라우저는 그 지면이 실제로 쓰는 서브셋만
 * 받으므로, 홈에 Gaegu 한글만 있으면 Gaegu **라틴** 서브셋은 정상적으로 안 온다.
 * 「안 왔다」와 「쓸 일이 없어 안 받았다」를 가르는 것은 **쓰는 자리가 있는가**이고,
 * 그건 선언이 아니라 렌더에만 있다.
 *
 * 그래서 판정은 글자 하나 단위다 — 텍스트의 코드포인트마다 ① 스택에서 그것을 덮는 첫 얼굴을
 * 찾고(못 찾으면 3층 위반) ② 그 얼굴에 요청 굵기의 면이 있는지 보고(없으면 2층 `noFace`)
 * ③ 그 면이 도착했는지 본다(안 왔으면 2층 `notArrived`).
 */
function probe(input: { generics: string[] }): ProbeResult {
  const { generics } = input;
  const norm = (s: string) => s.trim().replace(/^["']|["']$/g, "");

  // 등록된 @font-face 를 패밀리별로 모은다. status 가 'unloaded' 여도 unicodeRange 와 weight 는
  // 읽힌다 — 그래서 그 지면이 아직 안 받은 서브셋의 덮개까지 판정할 수 있다.
  const faces = new Map<string, { weight: string; range: string; status: string }[]>();
  document.fonts.forEach((f) => {
    const key = norm(f.family).toLowerCase();
    const list = faces.get(key) ?? [];
    list.push({ weight: f.weight || "400", range: f.unicodeRange || "U+0-10FFFF", status: f.status });
    faces.set(key, list);
  });

  const parseRange = (spec: string): [number, number][] => {
    const out: [number, number][] = [];
    for (const part of spec.split(",")) {
      const t = part.trim().replace(/^u\+/i, "");
      if (t.includes("?")) {
        out.push([parseInt(t.replace(/\?/g, "0"), 16), parseInt(t.replace(/\?/g, "F"), 16)]);
      } else if (t.includes("-")) {
        const [a, b] = t.split("-");
        out.push([parseInt(a, 16), parseInt(b, 16)]);
      } else if (t) {
        const n = parseInt(t, 16);
        out.push([n, n]);
      }
    }
    return out;
  };
  /** 가변폰트는 `"100 900"` 처럼 범위로 온다. 정적 면은 한 값이고 **정확히 일치**해야 한다. */
  const weightFits = (spec: string, want: number): boolean => {
    const parts = spec.trim().split(/\s+/).map(Number);
    if (parts.length >= 2) return want >= parts[0] && want <= parts[1];
    return parts[0] === want;
  };
  const facesFor = (family: string, cp: number) =>
    (faces.get(family.toLowerCase()) ?? []).filter((f) => parseRange(f.range).some(([a, b]) => cp >= a && cp <= b));

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const noFace = new Map<string, Finding>();
  const notArrived = new Map<string, Finding>();
  const uncovered = new Map<string, Finding>();
  let nodes = 0;

  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.nodeValue;
    if (!text || !text.trim()) continue;
    const el = n.parentElement;
    if (!el) continue;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    nodes++;
    const stack = cs.fontFamily.split(",").map(norm).filter(Boolean);
    const real = stack.filter((f) => !generics.includes(f));
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const cls = typeof el.className === "string" && el.className ? "." + el.className.split(" ")[0] : "";
    const tag = el.tagName.toLowerCase() + cls;
    const stackStr = stack.join(", ");
    const sample = text.trim().slice(0, 32);
    const seen = new Set<number>();

    for (const ch of text) {
      const cp = ch.codePointAt(0);
      if (cp === undefined || cp <= 0x20 || seen.has(cp)) continue;
      seen.add(cp);

      // 이 글자를 실제로 맡는 얼굴 — 스택 앞에서부터 처음으로 그 코드포인트를 덮는 것.
      const family = real.find((f) => facesFor(f, cp).length > 0);
      if (!family) {
        const key = stackStr + " / " + ch;
        if (!uncovered.has(key)) {
          uncovered.set(key, { family: "", weight, stack: stackStr, sample, tag, char: ch, cp: cp.toString(16) });
        }
        continue;
      }
      const fit = facesFor(family, cp).filter((f) => weightFits(f.weight, weight));
      const row = { family, weight, stack: stackStr, sample, tag, char: ch, cp: cp.toString(16) };
      if (fit.length === 0) {
        const key = family + " " + weight + " " + tag;
        if (!noFace.has(key)) noFace.set(key, row);
      } else if (!fit.some((f) => f.status === "loaded")) {
        const key = family + " " + weight + " " + tag;
        if (!notArrived.has(key)) notArrived.set(key, row);
      }
    }
  }
  return {
    noFace: [...noFace.values()],
    notArrived: [...notArrived.values()],
    uncovered: [...uncovered.values()],
    nodes,
    faces: faces.size,
  };
}

async function runtimeLayers(base: string): Promise<LayerResult> {
  const failures: string[] = [];
  const notes: string[] = [];
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: VIEWPORT });

  const routes = [...ROUTES];
  const post = await firstPostRoute(base);
  if (post) routes.push(post);
  else notes.push("글이 없어 글 상세는 건너뛴다");

  const generics = [...GENERIC_FAMILIES];
  let totalNodes = 0;
  /** 같은 결함이 여러 지면에 나오므로 사유로 접고 지면을 모은다. */
  const found = new Map<string, { layer: string; row: Finding; where: string[] }>();

  for (const route of routes) {
    const res = await page.goto(`${base}${route}`, { waitUntil: "networkidle" }).catch(() => null);
    if (!res || res.status() >= 400) {
      failures.push(`${route} — 지면이 안 열린다 (${res?.status() ?? "응답 없음"})`);
      continue;
    }
    // 폰트가 다 도착한 뒤에 잰다 — 안 기다리면 2층이 경합으로 빨개진다.
    await page.evaluate(() => document.fonts.ready);
    const r = (await page.evaluate(probe, { generics })) as ProbeResult;
    totalNodes += r.nodes;
    const buckets: [string, Finding[]][] = [
      ["noFace", r.noFace],
      ["notArrived", r.notArrived],
      ["uncovered", r.uncovered],
    ];
    for (const [layer, rows] of buckets) {
      for (const row of rows) {
        const key = `${layer} ${row.family} ${row.weight} ${row.tag} ${row.char}`;
        const e = found.get(key) ?? { layer, row, where: [] };
        e.where.push(route);
        found.set(key, e);
      }
    }
    console.log(
      `  ·· ${route.padEnd(28)} 텍스트 ${String(r.nodes).padStart(4)} · @font-face ${r.faces} · ` +
        `없는 면 ${r.noFace.length} · 미도착 ${r.notArrived.length} · 덮개 없음 ${r.uncovered.length}`,
    );
  }

  for (const { layer, row, where } of found.values()) {
    const at = `${row.tag} / «${row.stack}» / "${row.sample}" (${where.join(", ")})`;
    if (layer === "noFace") {
      failures.push(
        `[2층] «${row.family}» 에 ${row.weight} 면이 없는데 그 자리가 ${row.weight} 을 요청한다 — ${at}. ` +
          "합성은 꺼져 있으므로(font-synthesis: style) 브라우저가 다른 굵기의 면으로 대체해 그린다.",
      );
    } else if (layer === "notArrived") {
      failures.push(
        `[2층] «${row.family}» ${row.weight} 이 도착하지 않았다 — ${at}. 선언은 있는데 화면은 폴백이다.`,
      );
    } else {
      failures.push(
        `[3층] «${row.char}»(U+${row.cp.toUpperCase()}) 를 그릴 면이 스택에 없다 — ${at}. ` +
          "그 글자는 보는 사람 OS 가 고른 얼굴로 그려진다.",
      );
    }
  }
  notes.push(`지면 ${routes.length}개 · 텍스트 노드 ${totalNodes}개 검사`);

  await browser.close();
  return { failures, notes };
}

/* ─────────────────────── 진입 ─────────────────────── */

function readSources(): Sources {
  const read = (rel: string) => {
    const p = path.join(ROOT, rel);
    if (!existsSync(p)) {
      console.error(`verify-type: ${rel} 가 없다.`);
      process.exit(2);
    }
    return readFileSync(p, "utf-8");
  };
  const publicFiles = new Set<string>();
  const fontsDir = path.join(ROOT, "public", "fonts");
  if (existsSync(fontsDir)) for (const f of readdirSync(fontsDir)) publicFiles.add(`/fonts/${f}`);
  return {
    fontsCss: read(SRC.fontsCss),
    baseLayout: read(SRC.baseLayout),
    tokensCss: read(SRC.tokensCss),
    renderViz: read(SRC.renderViz),
    vizGuide: read(SRC.vizGuide),
    publicFiles,
  };
}

async function main() {
  const failures: string[] = [];
  const notes: string[] = [];
  const sources = readSources();

  // 「무엇을 실제로 쟀는가」를 마지막 줄이 말한다 (KAN-078).
  let ranStatic = false;
  let ranRuntime = false;

  if (!NO_SELF_TEST) {
    const st = selfTest(sources);
    failures.push(...st.failures);
    notes.push(...st.notes);
  }

  if (!SELF_TEST_ONLY) {
    const r = staticLayer(sources);
    failures.push(...r.failures);
    notes.push(...r.notes);
    ranStatic = true;
  }

  let server: ChildProcess | null = null;
  if (!SELF_TEST_ONLY && !STATIC_ONLY) {
    let base = baseArg;
    if (!base) {
      if (!existsSync(path.join(ROOT, "dist"))) {
        console.error("verify-type: dist/ 가 없다. `bun run build` 를 먼저 돌려라 (또는 --static 으로 1층만).");
        process.exit(2);
      }
      const port = await freePort();
      base = `http://localhost:${port}`;
      console.log(`verify-type: dist/ 를 ${base} 로 띄운다 (astro preview)…`);
      server = spawn("bunx", ["astro", "preview", "--port", String(port)], { cwd: ROOT, stdio: "ignore" });
      if (!(await waitForServer(base))) {
        server.kill();
        console.error("verify-type: preview 서버가 안 떴다.");
        process.exit(2);
      }
    }
    console.log(`verify-type: ${base} 에서 2·3층 검사\n`);
    const r = await runtimeLayers(base);
    failures.push(...r.failures);
    notes.push(...r.notes);
    ranRuntime = true;
    server?.kill();
  }

  console.log(`\n역할 ${TYPE_ROLES.length}개 — ${TYPE_ROLES.map((r) => `${r.token}(${r.weights.join("·")})`).join(" · ")}`);
  for (const n of notes) console.log(`  · ${n}`);

  if (failures.length) {
    console.error("\n✗ 글자 게이트 실패.");
    for (const f of failures) console.error(`  ${f}`);
    console.error(
      "\n  고치는 법: 역할표(src/lib/typeRoles.ts)가 정본이다. 없는 웨이트를 쓰고 있으면 그 자리를\n" +
        "  실재하는 단으로 내리거나(§5 굵기 3단) `bun run fonts:build` 로 굽는다. 한글이 안 덮이면\n" +
        "  그 토큰 스택 **끝에** 본문 서체를 놓는다. 선언 다섯 곳이 갈렸으면 다섯을 함께 고친다 —\n" +
        "  하나만 고치면 지면과 래스터가 다른 얼굴로 나가고 hero 는 굽고 나면 굳는다.",
    );
  }

  // ── 마지막 줄은 「무엇을 안 쟀는가」까지 말한다. 안 그러면 자가검사만 돈 실행이 통과로 읽힌다.
  const skipped = [!ranStatic && "1층", !ranRuntime && "2·3층"].filter(Boolean);
  const tail = skipped.length ? ` (${skipped.join(" · ")} 대조 안 함)` : "";
  if (failures.length) {
    console.error(`\n판정: 실패 ${failures.length}건${tail}`);
    process.exit(1);
  }
  console.log(`\n✓ 글자 게이트 통과${tail}`);
  process.exit(0);
}

await main();
