#!/usr/bin/env bun
/**
 * verify-deco — 데코가 **글자를 덮거나 조작을 먹는지** 실제 렌더에서 잡는다.
 *
 * 왜 필요한가: 데코는 전부 `pointer-events:none` + `aria-hidden` 이라 빌드도 타입도
 * 접근성 검사도 통과한다. 깨지는 방식이 둘 다 **기하**다 —
 *   ① 부품 상자가 글자 위에 얹힌다(DECO_KIT §5 규칙 3)
 *   ② 부품이 링크·입력·드래그 표면의 포인터를 가로챈다(§5 규칙 9)
 * 둘 다 "발행 전 눈으로 봐라"로 두 번 놓쳤다. KAN-058 에서 ②는 지도 팬이 테이프 띠에서
 * 죽는 것으로(1차), ①은 후보 패널 클립이 `기간 범위` 라벨을 덮는 것으로(2차) 터졌고,
 * 스크린샷을 보면서도 ①을 못 봤다. 그래서 판정을 기계로 옮긴다 — `verify-viz` 와 같은 이유.
 *
 * 무엇을 보나:
 *   ① **겹침 전수 대조** — 보이는 데코 상자 × **실제 글자 런** 상자.
 *      요소 상자로 재면 안 된다: 폭 100% 인 `<p>` 는 글씨가 왼쪽에서 끝나도 오른쪽 끝까지
 *      상자를 차지해서, 그 위 빈 자리에 붙은 테이프가 거짓 양성으로 잡힌다(실제로 잡혔다).
 *      `Range.getClientRects()` 는 줄바꿈된 글자 런마다 상자를 주므로 잉크가 있는 자리만 본다.
 *   ② **도달 가능성** — 지정한 컨트롤이 자기 좌표에서 `elementFromPoint` 로 자기 자신을
 *      돌려주는지. 이건 pointer-events 와 z 순서를 그대로 따르므로 실제 이벤트 라우팅과 같다.
 *   ③ **가로 오버플로** — 여백 밖으로 나간 부품이 스크롤바를 만드는지.
 *
 * 폭마다·상태마다 본다. 데코가 사는 여백은 **폭에 따라 사라지는 값**이라 한 폭만 봐선
 * 모른다(글 지도 후보 패널의 빈 구간은 1280px 546 → 390px 32px 로 줄어든다).
 *
 * 사용:
 *   bun run deco:verify                              # 전 지면 (dist/ 를 스스로 띄운다)
 *   bun run deco:verify /graph                       # 한 지면만
 *   bun run deco:verify --base http://localhost:4323 # 이미 띄운 dev 서버로
 *
 * `verify-viz` 와 같은 이유로 **떠 있는 서버에 알아서 붙지 않는다** — 4321 은 같은 레포의
 * 다른 워크트리가 잡고 있기 쉽고, 그러면 남의 코드를 검사해 이 브랜치의 판정으로 보고한다.
 */
import { existsSync } from "node:fs";
import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import type { Page } from "playwright";

const ROOT = process.cwd();

/** 검사할 지면과, 그 지면에서 반드시 눌려야 하는 컨트롤. */
interface Target {
  route: string;
  /** 데코가 사는 영역. 이 안의 글자와만 대조한다(본문 전체를 훑으면 느리고 뜻도 없다). */
  scope: string;
  /** `elementFromPoint` 로 자기 자신이 나와야 하는 것들 */
  controls: string[];
  /** 지면 고유의 추가 상태 — 클릭해서 열고 다시 검사한다 */
  toggles?: { click: string; label: string }[];
}

const TARGETS: Target[] = [
  {
    route: "/graph",
    scope: ".graph-page",
    controls: [
      ".cmd-input",
      ".graph-help-btn",
      ".gauge-track",
      ".gauge-handle",
      ".gauge-clear",
      ".cand-chip",
      '.graph-zoom button[aria-label="확대"]',
    ],
    toggles: [{ click: ".graph-help-btn", label: "도움말 열림" }],
  },
  {
    route: "/posts",
    scope: ".wrap",
    controls: [".pf-chip", ".post-title a, .post-item a"],
  },
  { route: "/", scope: ".hero, .recent", controls: [".btn-filled", ".post-item a"] },
];

const WIDTHS = [1280, 769, 768, 480, 390];

function parseArgs(argv: string[]) {
  const a = { routes: [] as string[], base: process.env.BASE ?? "" };
  for (let i = 2; i < argv.length; i++) {
    const v = argv[i];
    if (v === "--base") a.base = argv[++i] ?? "";
    else if (!v.startsWith("--")) a.routes.push(v.startsWith("/") ? v : `/${v}`);
  }
  return a;
}

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

/**
 * 브라우저 안에서 도는 검사기. `page.evaluate` 로 넘기므로 클로저를 쓰지 않는다.
 *
 * 겹침 허용 오차를 2px 둔다 — 글리프 힌팅과 소수점 반올림 여유이고, 이보다 작게 겹치는
 * 것은 눈에 "덮었다"로 안 보인다(verify-viz 의 TOLERANCE 와 같은 취지).
 */
function inspect(scopeSel: string, controls: string[]) {
  const TOL = 2;
  const root =
    scopeSel
      .split(",")
      .map((s) => document.querySelector(s.trim()))
      .find(Boolean) ?? document.body;

  const decos = [...root.querySelectorAll(".deco-layer > *")]
    .map((e) => ({
      name: (e.getAttribute("class") || e.tagName).toString().trim(),
      b: e.getBoundingClientRect(),
    }))
    .filter((d) => d.b.width > 0 && d.b.height > 0);

  // 실제 글자 런. 요소 상자가 아니라 Range 로 재는 이유는 파일 머리 주석 참고.
  const runs: { t: string; b: DOMRect }[] = [];
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    if (!n.nodeValue || !n.nodeValue.trim()) continue;
    const p = n.parentElement;
    // svg 안은 지도·도식이라 제외(그쪽 겹침은 verify-viz 가 본다).
    if (!p || p.closest("svg") || p.closest(".deco-layer")) continue;
    const cs = getComputedStyle(p);
    if (cs.visibility === "hidden" || cs.display === "none") continue;
    const rg = document.createRange();
    rg.selectNodeContents(n);
    for (const r of Array.from(rg.getClientRects()))
      if (r.width > 0 && r.height > 0) runs.push({ t: n.nodeValue.trim().slice(0, 18), b: r });
  }

  const over = (a: DOMRect, b: DOMRect) =>
    a.left < b.right - TOL && a.right > b.left + TOL &&
    a.top < b.bottom - TOL && a.bottom > b.top + TOL;

  const overlaps: string[] = [];
  for (const d of decos)
    for (const t of runs) if (over(d.b, t.b)) overlaps.push(`${d.name} × "${t.t}"`);

  const blocked: string[] = [];
  for (const sel of controls) {
    const el = document.querySelector(sel);
    if (!el) continue; // 지면 상태에 따라 없을 수 있다(빈 목록 등)
    let b = el.getBoundingClientRect();
    if (b.width === 0 || b.height === 0) continue;
    // `elementFromPoint` 는 **뷰포트** 좌표라 화면 밖이면 null 을 준다. 스크롤해서
    // 안 보이는 것을 "가로채였다"로 읽으면 거짓 양성이 난다(도움말을 열면 지도가
    // 밀려 줌 버튼이 접히는 게 그 경우였다). 그래서 재기 전에 끌어올린다.
    const inView = b.top >= 0 && b.bottom <= innerHeight && b.left >= 0 && b.right <= innerWidth;
    if (!inView) {
      // `behavior:"instant"` 가 **필수**다 — global.css 가 `scroll-behavior: smooth` 를
      // 켜 두어서 기본값으로 부르면 스크롤이 애니메이션되고, 바로 다음 줄의 rect 가
      // 아직 옛 자리라 그대로 화면 밖 → null → 거짓 "가로챔"이 된다.
      el.scrollIntoView({ block: "center", inline: "center", behavior: "instant" });
      b = el.getBoundingClientRect();
    }
    const top = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2);
    if (!top || !(el.contains(top) || el === top))
      blocked.push(`${sel} ← ${top ? top.tagName + "." + (top.getAttribute("class") || "") : "null"}`);
  }

  return {
    decoCount: decos.length,
    runCount: runs.length,
    overlaps,
    blocked,
    overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const targets = args.routes.length
    ? TARGETS.filter((t) => args.routes.includes(t.route))
    : TARGETS;
  if (!targets.length) {
    console.error(`verify-deco: 검사할 지면이 없다. 알려진 지면: ${TARGETS.map((t) => t.route).join(" ")}`);
    process.exit(2);
  }

  let base = args.base;
  let server: ChildProcess | null = null;
  if (!base) {
    if (!existsSync(path.join(ROOT, "dist"))) {
      console.error("verify-deco: dist/ 가 없다. `bun run build` 를 먼저 돌려라.");
      process.exit(2);
    }
    const port = await freePort();
    base = `http://localhost:${port}`;
    console.log(`verify-deco: dist/ 를 ${base} 로 띄운다 (astro preview)…`);
    server = spawn("bunx", ["astro", "preview", "--port", String(port)], {
      cwd: ROOT,
      stdio: "ignore",
    });
    if (!(await waitForServer(base))) {
      server.kill();
      console.error("verify-deco: preview 서버가 안 떴다.");
      process.exit(2);
    }
  }
  console.log(`verify-deco: ${base} 검사\n`);

  const { chromium } = await import("playwright");
  const browser = await chromium.launch();

  interface Fail { where: string; kind: string; detail: string }
  const fails: Fail[] = [];
  let checks = 0;

  const run = async (page: Page, t: Target, where: string) => {
    const r = await page.evaluate(
      ({ scope, controls }) => (window as any).__inspect(scope, controls),
      { scope: t.scope, controls: t.controls },
    );
    checks++;
    for (const o of r.overlaps) fails.push({ where, kind: "글자 덮음(규칙 3)", detail: o });
    for (const b of r.blocked) fails.push({ where, kind: "조작 가로챔(규칙 9)", detail: b });
    if (r.overflowX) fails.push({ where, kind: "가로 오버플로", detail: "scrollWidth > clientWidth" });
    const bad = r.overlaps.length + r.blocked.length + (r.overflowX ? 1 : 0);
    console.log(
      `${bad ? "FAIL " : "  ok "}  ${where}  (데코 ${r.decoCount} × 글자런 ${r.runCount})`,
    );
  };

  for (const t of targets) {
    for (const W of WIDTHS) {
      const page = await browser.newPage({ viewport: { width: W, height: 1200 } });
      await page.addInitScript(`window.__inspect = ${inspect.toString()}`);
      await page.goto(base + t.route, { waitUntil: "networkidle" });
      // 아일랜드(지도 시뮬레이션 등)가 자리를 잡을 시간
      await page.waitForTimeout(1200);
      await run(page, t, `${t.route} @${W}`);
      for (const tg of t.toggles ?? []) {
        if (await page.locator(tg.click).count()) {
          await page.click(tg.click);
          await page.waitForTimeout(400);
          await run(page, t, `${t.route} @${W} ${tg.label}`);
          await page.click(tg.click);
          await page.waitForTimeout(200);
        }
      }
      await page.close();
    }
  }

  await browser.close();
  if (server) server.kill();

  console.log(`\n지면 ${targets.length}개 × 폭 ${WIDTHS.length}개, 검사 ${checks}회.`);
  if (fails.length) {
    console.error(`\n✗ ${fails.length}건 — 데코가 글자를 덮거나 조작을 먹는다.\n`);
    for (const f of fails) console.error(`  [${f.where}] ${f.kind}: ${f.detail}`);
    console.error(
      "\n고치는 법: 부품을 **내용이 비어 있는 쪽**으로 옮기거나(DECO_KIT §5 규칙 3·8),\n" +
        "겹치는 자리면 hover={false}(규칙 9), 자리가 아예 없는 폭이면 접어라(규칙 6).",
    );
    process.exit(1);
  }
  console.log("✓ 겹침·가로챔·오버플로 없음");
}

await main();
