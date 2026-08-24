#!/usr/bin/env bun
/**
 * verify-widths — **한 화면 안에서 셸과 본문 컨테이너의 폭이 같은지** 실제 렌더에서 잡는다.
 *
 * 왜 필요한가: 폭이 어긋나도 빌드도 타입도 초록이다. 깨지는 방식은 하나다 —
 * 셸(GNB·푸터)은 토큰(`--shell-max` → `--content-max`)을 읽는데 지면이 자기 CSS 에 px 를
 * 박으면 둘이 다른 값을 든다. 실제로 홈에서 GNB 720px 대 본문 1100px, 글 지도에서 720px 대
 * 960px 이 그렇게 났고(KAN-068), **눈으로만 잡히던 결함이라 오래 남아 있었다.**
 *
 * `grep` 으로는 못 잡는다. 지면이 `var(--wide-max)` 를 제대로 쓰면서 `BaseLayout` 에
 * `width="wide"` 를 안 넘기는 경우가 정확히 그 반대 방향의 같은 어긋남인데, 그건 CSS 에
 * 숫자가 없어 검색에 안 걸린다. 그래서 렌더해서 잰다 — `verify-deco` 와 같은 이유.
 *
 * 무엇을 보나: 지면마다 `.header-inner` · 페이지 컨테이너 · `.footer-inner` 의 렌더 폭을
 * 재서 **셋이 한 값인지** 본다. 어느 값이어야 하는지는 안 본다(홈 1100 · 글 목록 720 은
 * 설계대로 다르다 — DESIGN_CONCEPT.md 「폭 체계」). 판정하는 것은 **지면 안의 일치**다.
 *
 * 사용:
 *   bun run width:verify                              # 전 지면 (dist/ 를 스스로 띄운다)
 *   bun run width:verify --base http://localhost:4323 # 이미 띄운 dev 서버로
 *
 * `verify-deco` 와 같은 이유로 **떠 있는 서버에 알아서 붙지 않는다** — 4321 은 같은 레포의
 * 다른 워크트리가 잡고 있기 쉽고, 그러면 남의 코드를 검사해 이 브랜치의 판정으로 보고한다.
 */
import { existsSync } from "node:fs";
import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";

const ROOT = process.cwd();

/** 셸과 나란히 놓고 재는 페이지 컨테이너 선택자. 지면이 늘면 여기에 더한다. */
const CONTAINERS = [
  ".hero-inner", // 홈 히어로
  ".recent", // 홈 최근 글
  ".graph-page", // 글 지도
  ".wrap", // 글 목록 · 카테고리 · 404
  ".post", // 글 상세
  ".talk", // 폭신 대담
].join(", ");

/** 검사 지면. 라우트가 404 면 그 자체가 실패다(선택자가 아니라 지면이 사라진 것). */
const ROUTES = ["/", "/graph", "/posts", "/404"];

/** 뷰포트. 폭 체계는 데스크톱 값이라 브레이크포인트 위에서만 본다. */
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

/** 첫 글 하나를 라우트에 보탠다 — 글 상세는 슬러그를 모르면 못 연다. */
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

async function main() {
  const argv = process.argv.slice(2);
  const bi = argv.indexOf("--base");
  let base = bi >= 0 ? argv[bi + 1] : undefined;
  let server: ChildProcess | null = null;

  if (!base) {
    if (!existsSync(path.join(ROOT, "dist"))) {
      console.error("verify-widths: dist/ 가 없다. `bun run build` 를 먼저 돌려라.");
      process.exit(2);
    }
    const port = await freePort();
    base = `http://localhost:${port}`;
    console.log(`verify-widths: dist/ 를 ${base} 로 띄운다 (astro preview)…`);
    server = spawn("bunx", ["astro", "preview", "--port", String(port)], { cwd: ROOT, stdio: "ignore" });
    if (!(await waitForServer(base))) {
      server.kill();
      console.error("verify-widths: preview 서버가 안 떴다.");
      process.exit(2);
    }
  }
  console.log(`verify-widths: ${base} 검사 (viewport ${VIEWPORT.width}px)\n`);

  const routes = [...ROUTES];
  const post = await firstPostRoute(base);
  if (post) routes.push(post);
  else console.log("  ·· 글이 없어 글 상세는 건너뛴다\n");

  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: VIEWPORT });

  const fails: string[] = [];
  for (const route of routes) {
    const res = await page.goto(`${base}${route}`, { waitUntil: "networkidle" }).catch(() => null);
    if (!res || res.status() >= 400) {
      fails.push(`${route} — 지면이 안 열린다 (${res?.status() ?? "응답 없음"})`);
      console.log(`  FAIL ${route.padEnd(26)} 지면이 안 열린다`);
      continue;
    }
    const rows: [string, number][] = await page.$$eval(
      `.header-inner, ${CONTAINERS}, .footer-inner`,
      (els) =>
        els.map(
          (e) => [e.className.toString().split(" ")[0], Math.round(e.getBoundingClientRect().width)] as [string, number],
        ),
    );
    const shell = rows.filter(([c]) => c === "header-inner" || c === "footer-inner");
    const body = rows.filter(([c]) => c !== "header-inner" && c !== "footer-inner");
    const detail = rows.map(([c, w]) => `${c}=${w}`).join(" · ");

    if (shell.length !== 2) {
      fails.push(`${route} — 셸을 못 찾았다 (${detail || "매칭 0건"})`);
      console.log(`  FAIL ${route.padEnd(26)} 셸을 못 찾았다`);
      continue;
    }
    if (body.length === 0) {
      // 컨테이너 선택자가 이 지면을 모른다 — 통과로 세면 검사가 조용히 비어 간다.
      fails.push(`${route} — 페이지 컨테이너를 못 찾았다. CONTAINERS 에 선택자를 더해라 (${detail})`);
      console.log(`  FAIL ${route.padEnd(26)} 페이지 컨테이너를 못 찾았다`);
      continue;
    }
    const widths = new Set(rows.map(([, w]) => w));
    if (widths.size === 1) {
      console.log(`  ok   ${route.padEnd(26)} ${detail}`);
    } else {
      fails.push(`${route} — 셸과 본문 폭이 다르다: ${detail}`);
      console.log(`  FAIL ${route.padEnd(26)} ${detail}`);
    }
  }

  await browser.close();
  server?.kill();

  console.log(`\n지면 ${routes.length}개 검사.`);
  if (fails.length === 0) {
    console.log("✓ 모든 지면에서 셸과 본문 폭이 일치");
    process.exit(0);
  }
  console.log(`✗ 어긋남 ${fails.length}건`);
  for (const f of fails) console.log(`  - ${f}`);
  console.log(
    "\n고치는 법: 페이지 컨테이너에 px 를 박지 말고 --content-max / --wide-max 를 쓰고,\n" +
      '넓은 판이면 BaseLayout 에 width="wide" 를 함께 넘겨라. 규칙은 DESIGN_CONCEPT.md 「폭 체계」.',
  );
  process.exit(1);
}

await main();
