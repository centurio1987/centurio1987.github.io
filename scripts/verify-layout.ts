#!/usr/bin/env bun
/**
 * verify-layout — **지면이 화면 안에 들어오고, 코드블록이 칸에 서는가.**
 *
 * 왜 필요한가.
 *   `talk-crdt-room-optimization` 이 렌더 검사 없이 나갔고 세 가지가 동시에 깨져 있었다.
 *   **셋 다 빌드·타입·`talk:verify`·`tokens:verify`·`width:verify` 가 초록인 채였다.**
 *
 *   ① 모바일(390px)에서 지면이 779px 로 벌어져 문단 오른쪽이 잘렸다 — `QA.astro` 의 flex 자식에
 *      `min-width: 0` 이 없어 도식 하나가 답변 칸 전체를 끌고 나갔다. `width:verify` 는 셸과 본문
 *      컨테이너의 **폭이 서로 같은지**만 보고, 글 상세는 첫 글 하나만 연다.
 *   ② 상자 선 도식이 한 줄도 안 맞았다 — 구글 JetBrains Mono 에 `─`·`│`·`→`·한글이 없어 고정폭이
 *      아닌 본문 서체로 떨어졌다(`─` 1.67칸, `가` 1.52칸). 같은 깨짐이 글 12편의 도식 44개에 있었다.
 *   ③ 긴 도식 줄이 접혔다 — `shikiConfig.wrap: true` 가 모든 코드블록을 `pre-wrap` 으로 만든다.
 *
 *   대담 경로(`talk-ingest`)의 확인 단계에는 렌더를 보는 검사가 하나도 없었고, 기술 글 경로도
 *   코드블록 도식을 보는 검사가 없었다. 이 게이트가 그 자리다.
 *
 * 무엇을 보나 — 축 셋. 판정은 축 모듈(`scripts/lib/layout/`)이 하고 규약은 여기가 진다.
 *   ① 지면 넘침(`overflow.ts`)  — 모든 지면 × 데스크톱 1440 · 모바일 390.
 *   ② 칸(`grid.ts`)             — 코드블록 글자가 칸의 1배·2배인가. 서체 파일 404 도 여기서 낸다.
 *   ③ 도식(`diagram.ts`)        — 도식이 안 접히는가 · 세로선이 한 열로 이어지는가(원문 오타).
 *
 * 왜 CI 밖인가. Playwright 가 필요하고 이 레포 CI 에는 Playwright 게이트가 0건이다
 *   (`deco:verify` · `width:verify` · `type:verify` 의 2·3층과 같다). 대신 대담 경로(`talk-ingest`)와
 *   발행 마무리(`ship-post`)의 확인 단계가 이 게이트를 부른다.
 *
 * 사용:
 *   bun run build && bun run layout:verify
 *   bun run layout:verify -- --route /posts/talk-crdt-room-optimization/   # 지면 하나만
 *   bun run layout:verify -- --base http://localhost:4323                  # 이미 띄운 서버로
 *   bun run layout:verify -- --self-test                                   # 고장 주입만
 *
 * `verify-widths` 와 같은 이유로 **떠 있는 서버에 알아서 붙지 않는다** — 4321 은 같은 레포의 다른
 * 워크트리가 잡고 있기 쉽다. 빈 포트를 잡아 `dist/` 를 띄운다.
 *
 * **판정은 마지막 줄과 종료코드 둘 다로 한다**(KAN-078). 지면을 실제로 안 잰 실행의 마지막 줄에는
 * 「대조 안 함」이 박힌다.
 *
 * 문제가 있으면 종료코드 1.
 */
import { existsSync, readdirSync } from "node:fs";
import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import type { Browser, Page } from "playwright";
import { DIAGRAM_CHARS } from "../src/lib/shiki-diagram-blocks.mjs";
import { measureOverflow } from "./lib/layout/overflow.ts";
import { measureGrid } from "./lib/layout/grid.ts";
import { measureDiagrams } from "./lib/layout/diagram.ts";
import { FAULTS, FIXTURE_CLEAN, type Fault } from "./lib/layout/selftest.ts";

const ROOT = process.cwd();
const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(name);
const opt = (name: string) => (argv.indexOf(name) >= 0 ? argv[argv.indexOf(name) + 1] : undefined);

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
} as const;
/** 마크다운 코드블록. 시뮬(React) 안의 `<pre>` 는 자기 서체를 따로 정하므로 대상이 아니다. */
const PRE = "pre.astro-code";
/** 세로로 이어지는 글자. 라틴 `|` 는 셸 파이프·표에 흔해 넣지 않는다. */
const VERTICALS = "│┃║╎╏┆┇┊┋┌┐└┘├┤┬┴┼╔╗╚╝╠╣╦╩╬╭╮╯╰┏┓┗┛┣┫┳┻╋▲▼↑↓↕";

type Findings = { overflow: string[]; grid: string[]; font: string[]; unwrapped: string[]; jog: string[] };
const empty = (): Findings => ({ overflow: [], grid: [], font: [], unwrapped: [], jog: [] });
const total = (f: Findings) => Object.values(f).reduce((n, a) => n + a.length, 0);

/* ───────────────────────────── 서버 ───────────────────────────── */

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

/** `dist/` 의 모든 지면. 글만이 아니다 — 넘침은 어느 지면에서든 같은 결함이다. */
function routesFromDist(): string[] {
  const dist = path.join(ROOT, "dist");
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name === "index.html") out.push("/" + path.relative(dist, dir).split(path.sep).join("/") + (dir === dist ? "" : "/"));
    }
  };
  walk(dist);
  return out.map((r) => r.replace(/^\/+/, "/")).sort();
}

/* ───────────────────────────── 재기 ───────────────────────────── */

async function settle(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
}

/** 지면 하나를 한 뷰포트에서 잰다. `desktop` 에서만 칸·도식을 본다 — 글자 폭은 뷰포트와 무관하다. */
async function measure(page: Page, where: string, vp: keyof typeof VIEWPORTS, f: Findings) {
  const o = await page.evaluate(measureOverflow);
  if (o.sw > o.vw + 1) {
    f.overflow.push(`${where} @${o.vw}px — 지면 ${o.sw}px. 범인: ${o.culprits.join(" / ") || "(못 짚었다)"}`);
  }
  if (vp !== "desktop") return;
  const g = await page.evaluate(measureGrid, PRE);
  for (const e of g.fontErrors) f.font.push(`${where} — 서체 «${e}» 를 못 받았다`);
  for (const b of g.offGrid) f.grid.push(`${where} 코드블록 #${b.block} «${b.head}» — ${b.chars.slice(0, 8).join(" ")}`);
  const d = await page.evaluate(measureDiagrams, { diagramChars: DIAGRAM_CHARS.source, verticals: VERTICALS, selector: PRE });
  for (const u of d.unwrapped) f.unwrapped.push(`${where} 도식 ${u}`);
  for (const j of d.jogs) f.jog.push(`${where} 코드블록 #${j.block} ${j.line}줄 ${j.col}열 — «${j.text.trim().slice(0, 48)}»`);
  return { blocks: g.blocks, diagrams: d.diagrams };
}

/* ───────────────────────────── 자가검사 ───────────────────────────── */

async function runFixture(browser: Browser, base: string, route: string, html: string, css: string | undefined, vp: keyof typeof VIEWPORTS) {
  const page = await browser.newPage({ viewport: VIEWPORTS[vp] });
  await page.goto(`${base}${route}`, { waitUntil: "load" });
  await page.evaluate(
    ({ html, css }) => {
      const main = document.querySelector("main") ?? document.body;
      main.innerHTML = html;
      if (css) {
        const s = document.createElement("style");
        s.textContent = css;
        document.head.appendChild(s);
      }
    },
    { html, css },
  );
  await settle(page);
  const f = empty();
  await measure(page, "fixture", vp, f);
  if (vp === "mobile") {
    // 넘침 고장은 모바일에서 넣지만 칸·도식 축도 같은 지면에서 0 이어야 한다 — 데스크톱으로 한 번 더.
    await page.setViewportSize(VIEWPORTS.desktop);
    await settle(page);
    const g = empty();
    await measure(page, "fixture", "desktop", g);
    f.grid.push(...g.grid);
    f.font.push(...g.font);
    f.unwrapped.push(...g.unwrapped);
    f.jog.push(...g.jog);
  }
  await page.close();
  return f;
}

async function selfTest(browser: Browser, base: string, route: string): Promise<{ failures: string[]; notes: string[] }> {
  const failures: string[] = [];
  const clean = await runFixture(browser, base, route, FIXTURE_CLEAN, undefined, "desktop");
  if (total(clean)) {
    failures.push(`깨끗한 픽스처에서 잡음 ${total(clean)}건 — ${Object.values(clean).flat().slice(0, 3).join(" / ")}`);
  }
  for (const fault of FAULTS as Fault[]) {
    const f = await runFixture(browser, base, route, fault.html, fault.css, fault.viewport ?? "desktop");
    if (f[fault.expect].length === 0) failures.push(`고장을 못 잡았다 — ${fault.name} (기대한 축: ${fault.expect})`);
  }
  return { failures, notes: [`자가검사 — 깨끗한 픽스처 잡음 ${total(clean)} · 고장 ${FAULTS.length}종 주입`] };
}

/* ───────────────────────────── 실행 ───────────────────────────── */

async function main() {
  let base = opt("--base");
  let server: ChildProcess | null = null;
  if (!base) {
    if (!existsSync(path.join(ROOT, "dist"))) {
      console.error("verify-layout: dist/ 가 없다. `bun run build` 를 먼저 돌려라.");
      process.exit(2);
    }
    const port = await freePort();
    base = `http://localhost:${port}`;
    console.log(`verify-layout: dist/ 를 ${base} 로 띄운다 (astro preview)…`);
    server = spawn("bunx", ["astro", "preview", "--port", String(port)], { cwd: ROOT, stdio: "ignore" });
    if (!(await waitForServer(base))) {
      server.kill();
      console.error("verify-layout: preview 서버가 안 떴다.");
      process.exit(2);
    }
  }

  const only = opt("--route");
  const routes = only ? [only] : routesFromDist();
  const selfOnly = flag("--self-test");
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  const failures: string[] = [];
  const notes: string[] = [];

  try {
    if (!flag("--no-self-test")) {
      const host = routes.find((r) => r.startsWith("/posts/") && r !== "/posts/") ?? routes[0];
      const st = await selfTest(browser, base, host);
      notes.push(...st.notes);
      for (const x of st.failures) failures.push(`[게이트] ${x}`);
    }

    const found = empty();
    let blocks = 0;
    let diagrams = 0;
    if (!selfOnly) {
      for (const route of routes) {
        for (const vp of ["desktop", "mobile"] as const) {
          const page = await browser.newPage({ viewport: VIEWPORTS[vp] });
          const res = await page.goto(`${base}${route}`, { waitUntil: "load" }).catch(() => null);
          if (!res || res.status() >= 400) {
            if (vp === "desktop") failures.push(`${route} — 지면이 안 열린다 (${res?.status() ?? "응답 없음"})`);
            await page.close();
            continue;
          }
          await settle(page);
          const m = await measure(page, route, vp, found);
          if (m) {
            blocks += m.blocks;
            diagrams += m.diagrams;
          }
          await page.close();
        }
      }
      notes.push(`지면 ${routes.length}개 × 뷰포트 2 · 코드블록 ${blocks}개 · 그중 도식 ${diagrams}개`);
    }

    console.log(`verify-layout — ${base}`);
    for (const n of notes) console.log(`  · ${n}`);

    const AXES: [keyof Findings, string, string][] = [
      ["overflow", "지면 넘침", "넘친 요소의 flex/grid 조상에 `min-width: 0` 을 주고, 넓은 내용(코드·표)은 자기 안에서 `overflow-x: auto` 로 스크롤하게 둔다."],
      ["font", "서체 도착 실패", "새 서체를 구웠으면 `bun run build` 를 다시 돌려 `public/fonts/` 를 `dist/` 로 옮긴다(`fonts:build` 는 빌드 뒤에 돈다)."],
      ["grid", "칸을 벗어난 글자", "`bun run fonts:build` 로 Code Grid 를 다시 구워 그 글자를 담고 `bun run build` 를 한 번 더 돌린다(굽기는 dist/ 에서 글자를 모으고, 구운 파일은 다음 빌드에서야 dist/ 로 간다). 두 원본(JetBrains Mono·Gowun Dodum) 모두에 없는 글자(이모지 등)면 코드블록에서 빼거나 같은 뜻의 칸 글자로 바꾼다."],
      ["unwrapped", "접히는 도식", "`src/lib/shiki-diagram-blocks.mjs` 변환기가 `astro.config.mjs` 의 `shikiConfig.transformers` 에 걸려 있는지 본다."],
      ["jog", "세로선이 한 칸 꺾인 도식", "원문에서 그 줄의 공백을 하나 빼거나 더해 위아래 줄과 같은 열로 맞춘다. 한글은 두 칸, 상자 선·화살표·①은 한 칸으로 센다. 대담이면 `talk.md` 를 고치고 `talk:build` 로 다시 굽는다."],
    ];
    for (const [key, label] of AXES) {
      if (found[key].length === 0) continue;
      failures.push(`${label} ${found[key].length}건`);
      console.error(`\n✗ ${label} ${found[key].length}건`);
      for (const x of found[key].slice(0, 40)) console.error(`  - ${x}`);
      if (found[key].length > 40) console.error(`  … 외 ${found[key].length - 40}건`);
    }

    if (failures.length) {
      console.error("\n✗ 레이아웃 검사 실패.");
      for (const x of failures) console.error(`  ${x}`);
      for (const [key, label, fix] of AXES) if (found[key].length) console.error(`  고치는 법(${label}): ${fix}`);
      if (failures.some((x) => x.startsWith("[게이트]"))) {
        console.error("  고치는 법(게이트): 측정 함수나 선택자가 빗나갔다 — scripts/lib/layout/ 의 축 모듈을 먼저 본다.");
      }
      process.exitCode = 1;
      return;
    }
    console.log(selfOnly ? "\n✓ 자가검사 통과 — 지면은 대조 안 함." : "\n✓ 넘침 0 · 칸 0 · 도식 0 — 모든 지면이 화면 안에 들어오고 코드블록이 칸에 선다.");
  } finally {
    await browser.close();
    server?.kill();
  }
}

await main();
