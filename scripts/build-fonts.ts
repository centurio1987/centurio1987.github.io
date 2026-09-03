#!/usr/bin/env bun
/**
 * build-fonts — Gowun Dodum 의 굵기 단을 굽고 **사이트가 쓰는 글자로** 서브셋해 자체 호스팅한다.
 *
 * 왜 필요한가.
 *   `DESIGN_CONCEPT.md` §5 는 h2·h3 에 `Gowun Dodum 700` 을 규정하는데 **그 웨이트가 없다.**
 *   배포본은 400 한 종이고 업스트림에도 다른 굵기가 없다(소스가 단일 마스터 하나다).
 *   그래서 화면의 굵은 글자는 전부 **브라우저 합성**이었고, `font-synthesis` 선언이 0건이라
 *   막을 것도 없었다. 합성 볼드는 `getComputedStyle` 의 `font-weight` 가 700 으로 같게 나오므로
 *   **어떤 자동 검사도 못 본다** — 눈으로만 보이는 종류의 결함이다(`verify-tokens` 와 같은 자리).
 *
 *   OFL 에 Reserved Font Name 선언이 없어 개작이 열려 있다. 굽는 것이 유일한 길이다.
 *
 * 왜 자체 호스팅인가 — 서브셋을 우리가 정할 수 있어서다.
 *   구글은 글자 빈도 구간으로 미리 쪼갠 서브셋을 주는데, 자체 호스팅이면 **빌드된 지면이 실제로
 *   쓰는 글자만** 한 벌로 굽는다. 400 한 벌만 봐도 그쪽이 더 싸다(글 한 편 111.7KB → 전 사이트
 *   85.2KB, 한 번 받고 영구 캐시). 근거는 `UI_CONSISTENCY_AUDIT.md` §7-7.
 *
 * 순서가 규약이다 — **`astro build` 뒤에 온다.**
 *   글자 수집이 `dist/**\/*.html` 을 입력으로 받기 때문이다. `dist/` 가 없으면 여기서 끝낸다.
 *   빌드는 이 스크립트에 의존하지 않으므로(폰트 파일이 없어도 46쪽이 그대로 나온다) 순환이 없다.
 *
 * 굽는 함정 셋과 그 자가검사는 `scripts/lib/fonts/bake.py` 에 있다 — 셋째(stroke 전 winding
 * 정규화)가 **조용히 지나가는** 종류라 면적으로 잡는다. 이 진입점은 규약만 진다.
 *
 * 사용:
 *   bun run build && bun run fonts:build
 *   bun scripts/build-fonts.ts --check    # 굽지 않고 준비 상태만 본다
 *
 * 문제가 있으면 종료코드 1.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const args = new Set(process.argv.slice(2));
const CHECK_ONLY = args.has("--check");

/** 작업 자리. 받아 온 원본과 구운 중간물이 여기 산다 — `.gitignore` 대상이다. */
const WORK = join(ROOT, ".fonts-build");
const VENV = join(WORK, "venv");
const PY = join(VENV, "bin", "python");
const SRC_TTF = join(WORK, "GowunDodum-Regular.ttf");
const OUT_DIR = join(ROOT, "public/fonts");

/**
 * 원본은 업스트림에서 받는다(7.2MB 라 레포에 안 넣는다). **sha256 을 박아 둔다** —
 * `main` 브랜치는 움직이는 표적이라, 안 박으면 어느 날 다른 아웃라인을 굽고도 조용히 지나간다.
 * 값이 어긋나면 업스트림이 바뀐 것이므로 **먼저 무엇이 바뀌었는지 보고** 이 상수를 고친다.
 */
const SRC_URL = "https://raw.githubusercontent.com/google/fonts/main/ofl/gowundodum/GowunDodum-Regular.ttf";
const SRC_SHA256 = "a6e457933227483a11758fd0947bc74422a106d46f0bf057fdaa5af94a30067d";

/** 파이썬 의존. 굽기는 `skia-pathops`, 서브셋·woff2 는 `fonttools[woff]` 다. */
const PY_DEPS = ["fonttools[woff]==4.64.0", "skia-pathops==0.9.2"];

/** 구울 단. 400 은 원본을 서브셋만 하고, 500·700 은 아웃라인을 확장해 만든다. */
const WEIGHTS = [400, 500, 700] as const;
const outFor = (w: number) => join(OUT_DIR, `gowun-dodum-${w}.woff2`);

const failures: string[] = [];
const notes: string[] = [];

const sh = (cmd: string, argv: string[]) =>
  execFileSync(cmd, argv, { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] }).toString();

// ── ① 파이썬 환경. 없으면 만들고, 있으면 그대로 쓴다(멱등).
function ensureVenv(): boolean {
  if (!existsSync(PY)) {
    mkdirSync(WORK, { recursive: true });
    try {
      sh("python3", ["-m", "venv", VENV]);
    } catch (e) {
      failures.push(`파이썬 가상환경을 못 만들었다 — python3 -m venv 가 필요하다: ${String(e).slice(0, 120)}`);
      return false;
    }
  }
  try {
    sh(PY, ["-c", "import fontTools, pathops, brotli"]);
    notes.push("파이썬 의존: 이미 서 있다");
  } catch {
    try {
      sh(join(VENV, "bin", "pip"), ["install", "--quiet", ...PY_DEPS]);
      notes.push(`파이썬 의존을 설치했다 — ${PY_DEPS.join(" · ")}`);
    } catch (e) {
      failures.push(`파이썬 의존 설치 실패(네트워크가 필요하다) — ${PY_DEPS.join(" · ")}: ${String(e).slice(0, 160)}`);
      return false;
    }
  }
  return true;
}

// ── ② 원본. 받아서 지문을 대조한다.
function ensureSource(): boolean {
  if (!existsSync(SRC_TTF)) {
    try {
      sh("curl", ["-sSL", "-o", SRC_TTF, SRC_URL]);
    } catch (e) {
      failures.push(`원본 서체를 못 받았다 — ${SRC_URL}: ${String(e).slice(0, 120)}`);
      return false;
    }
  }
  const got = createHash("sha256").update(readFileSync(SRC_TTF)).digest("hex");
  if (got !== SRC_SHA256) {
    failures.push(
      `원본 서체의 sha256 이 다르다 — 박아 둔 값 ${SRC_SHA256.slice(0, 16)}… , 받은 값 ${got.slice(0, 16)}… . ` +
      `업스트림이 바뀐 것이므로 무엇이 바뀌었는지 먼저 보고 SRC_SHA256 을 고친다.`,
    );
    return false;
  }
  notes.push(`원본 400 — ${(statSync(SRC_TTF).size / 1024).toFixed(0)} KB (sha256 대조 통과)`);
  return true;
}

// ── ③ 사이트가 쓰는 글자. 빌드 산출물에서 모은다.
const TAG = /<(script|style)[\s\S]*?<\/\1>|<[^>]+>/g;
const ENTITY = /&(#\d+|#x[0-9a-fA-F]+|[a-zA-Z]+);/g;

function collectGlyphs(): string | null {
  const dist = join(ROOT, "dist");
  if (!existsSync(dist)) {
    failures.push("dist/ 가 없다 — 글자 수집이 빌드 산출물을 입력으로 받는다. `bun run build` 를 먼저 돌려라.");
    return null;
  }
  const chars = new Set<string>();
  let htmlOnly = 0;
  const take = (text: string) => { for (const ch of text) if (ch.codePointAt(0)! > 32) chars.add(ch); };
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".html")) take(readFileSync(p, "utf-8").replace(TAG, " ").replace(ENTITY, " "));
    }
  };
  walk(dist);
  htmlOnly = chars.size;
  // **HTML 만으로는 모자란다** — 글 안 React 시뮬은 라벨을 런타임에 그리므로 그 글자가
  // 정적 HTML 에 없다. 실측으로 넷(`깜`·`멉`·`옴`·`킴`)이 그렇게 빠졌고, 빠진 글자는
  // 폴백 서체로 조용히 그려진다. 그래서 번들 JS 의 문자열까지 담는다 —
  // 주석·에러 문구까지 딸려 오지만 그쪽으로 넘치는 비용이 빠뜨리는 비용보다 훨씬 싸다.
  const walkJs = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walkJs(p);
      else if (e.name.endsWith(".js")) take(readFileSync(p, "utf-8"));
    }
  };
  walkJs(dist);
  // 지면에 아직 안 나온 글자도 최소한은 담는다 — 한글 자모·기본 문장부호가 없으면
  // 새 글 한 편이 폴백 서체로 떨어진다. 라틴·숫자는 어차피 전부 나온다.
  for (let c = 0x21; c <= 0x7e; c++) chars.add(String.fromCodePoint(c));
  const text = [...chars].sort().join("");
  const file = join(WORK, "glyphs.txt");
  writeFileSync(file, text, "utf-8");
  const hangul = [...chars].filter((c) => c >= "가" && c <= "힣").length;
  notes.push(
    `글자 수집 — 고유 ${chars.size}자(완성형 한글 ${hangul}) · dist/ 의 HTML 전수 ${htmlOnly}자 ` +
    `+ 번들 JS 의 런타임 문자열 ${chars.size - htmlOnly}자`,
  );
  return file;
}

// ── 실행.
mkdirSync(OUT_DIR, { recursive: true });
const ready = ensureVenv() && ensureSource();
const glyphFile = ready ? collectGlyphs() : null;

if (ready && glyphFile && !CHECK_ONLY) {
  const cfg = {
    src: SRC_TTF, work: WORK, glyph_file: glyphFile,
    weights: [...WEIGHTS],
    out: Object.fromEntries(WEIGHTS.map((w) => [String(w), outFor(w)])),
  };
  try {
    const out = sh(PY, [join(ROOT, "scripts/lib/fonts/bake.py"), JSON.stringify(cfg)]);
    const report = JSON.parse(out.trim().split("\n").at(-1)!);
    failures.push(...(report.failures ?? []));
    for (const w of report.weights ?? []) {
      const size = existsSync(outFor(w.weight)) ? (statSync(outFor(w.weight)).size / 1024).toFixed(1) : "?";
      notes.push(
        w.baked
          ? `${w.weight} — 구웠다: 글리프 ${w.glyphs}개 · 실패 ${w.failed} · ${w.seconds}s · ` +
            `면적 +${((w.area_gain ?? 0) * 100).toFixed(0)}%(속 빔 자가검사) · 서브셋 ${size} KB`
          : `${w.weight} — 원본을 서브셋만 했다: ${size} KB`,
      );
    }
  } catch (e) {
    failures.push(`굽기가 죽었다 — ${String(e).slice(0, 400)}`);
  }
}

console.log(`빵토 서체 파이프라인 — 출력 ${OUT_DIR.replace(ROOT + "/", "")}`);
for (const n of notes) console.log(`  · ${n}`);

if (failures.length) {
  console.error("\n✗ 서체 굽기 실패.");
  for (const f of failures) console.error(`  ${f}`);
  console.error(
    "\n  고치는 법: dist/ 가 없으면 `bun run build` 를 먼저 돌려라. 면적 자가검사가 걸렸으면\n" +
    "  scripts/lib/fonts/bake.py 의 `outline()` 에서 stroke 전 winding 정규화가 빠진 것이다 —\n" +
    "  그 상태는 「실패 0」으로 끝나고 잉크 총량도 늘어서, 면적 말고는 아무것도 안 잡는다.\n" +
    "  sha256 이 어긋났으면 업스트림 원본이 바뀐 것이니 무엇이 바뀌었는지 먼저 보고 상수를 고친다.",
  );
  process.exit(1);
}
console.log(CHECK_ONLY ? "\n✓ 준비 상태 이상 없음(굽지 않았다)." : "\n✓ 서체 3단을 구웠다.");
