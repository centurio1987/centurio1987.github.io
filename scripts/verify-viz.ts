#!/usr/bin/env bun
/**
 * verify-viz — viz 시각물의 **텍스트 넘침**을 실제 렌더에서 잡는다.
 *
 * 왜 필요한가: SVG `<text>` 는 리플로도 클리핑도 하지 않는다. 상자보다 긴 라벨은
 * 에러 없이 상자 밖으로 흘러 viewBox 경계에서 잘린 채 렌더된다. 빌드는 초록이고
 * 타입도 통과한다 — 눈으로 보기 전까지 아무도 모른다. IMAGE_GUIDE 의 "텍스트는
 * 짧게"(권고)와 "발행 전 눈으로 봐라"(사람)만으로는 두 번 연속 놓쳤다(KAN-016 →
 * vpn-anatomy-7). 그래서 판정을 기계로 옮긴다.
 *
 * 무엇을 보나: 각 `figure.viz-figure svg` 안의 모든 `<text>` 를
 *   ① 그 글을 담는 상자(`rect[data-viz-part="shape"]`) 안에 드는지
 *   ② 그 상자가 없으면 viewBox 안에 드는지
 * 로 재고, 넘치면 실패한다.
 *
 * 가운데 정렬 라벨을 상자 **밖 아래**에 두는 배치(Comparison magnitude 의 값·라벨,
 * ProcessSteps 뱃지 캡션)는 설계상 정상이라 ①에서 제외하고 ②로만 본다.
 *
 * 사용:
 *   bun run viz:verify                                    # 전 글 (dist/ 를 스스로 띄운다)
 *   bun run viz:verify vpn-anatomy-7                      # 특정 글만
 *   bun run viz:verify --base http://localhost:4323       # 이미 띄운 dev 서버로
 *
 * 기본값은 **빈 포트에 이 워크트리의 `dist/` 를 직접 띄우는 것**이다(그래서 `bun run
 * build` 가 선행돼야 한다). 떠 있는 서버에 알아서 붙지 않는다 — 4321 은 같은 레포의
 * *다른 워크트리*가 잡고 있기 쉽고, 그러면 남의 코드를 검사해 이 브랜치의 판정으로
 * 보고한다(실제로 그렇게 오탐이 났다). 돌아가는 dev 서버를 쓰려면 `--base` 로 명시한다.
 */
import { readdirSync, existsSync } from "node:fs";
import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "src/content/posts");
/** 허용 오차(viewBox 단위). 글리프 힌팅·소수점 반올림 여유. */
const TOLERANCE = 1.5;

function parseArgs(argv: string[]) {
  const a = { slugs: [] as string[], serve: true, base: process.env.BASE ?? "" };
  for (let i = 2; i < argv.length; i++) {
    const t = argv[i];
    if (t === "--no-serve") a.serve = false;
    else if (t === "--base") a.base = argv[++i] ?? "";
    else a.slugs.push(t);
  }
  return a;
}

/** 본문에 viz 컴포넌트를 가진 글 slug 목록. */
function allSlugs(): string[] {
  const dir = path.join(ROOT, "src/components/posts");
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((slug) =>
      existsSync(path.join(POSTS_DIR, `${slug}.mdx`)) ||
      existsSync(path.join(POSTS_DIR, `${slug}.md`)),
    )
    .sort();
}

/** OS 가 비어 있다고 알려주는 포트 하나를 받아온다. */
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

interface Overflow {
  slug: string;
  fig: number;
  pattern: string;
  scope: "box" | "viewBox";
  over: number;
  boxW: number;
  textW: number;
  text: string;
}

async function main() {
  const args = parseArgs(process.argv);
  const slugs = args.slugs.length ? args.slugs : allSlugs();
  if (!slugs.length) {
    console.log("verify-viz: 검사할 글이 없다.");
    return;
  }

  let base = args.base;
  let server: ChildProcess | null = null;

  if (!base) {
    // **떠 있는 서버에 붙지 않는다.** 4321 은 이 레포의 *다른 워크트리*가 잡고 있기
    // 십상이고(Orca 병렬 워크트리), 그러면 남의 코드베이스를 검사하고 그 결과를
    // 이 브랜치의 판정으로 보고한다 — 실제로 그렇게 오탐이 났다.
    // 자동 모드에서는 **빈 포트에 내 dist/ 를 직접 띄운다**. 떠 있는 dev 서버를
    // 쓰고 싶으면 `--base` 로 명시해라(그건 사람의 판단이다).
    if (!args.serve) {
      console.error("verify-viz: --no-serve 를 쓰려면 --base 로 검사할 서버를 지정해라.");
      process.exit(2);
    }
    if (!existsSync(path.join(ROOT, "dist"))) {
      console.error("verify-viz: dist/ 가 없다. `bun run build` 를 먼저 돌려라.");
      process.exit(2);
    }
    const port = await freePort();
    base = `http://localhost:${port}`;
    console.log(`verify-viz: dist/ 를 ${base} 로 띄운다 (astro preview)…`);
    server = spawn("bunx", ["astro", "preview", "--port", String(port)], {
      cwd: ROOT,
      stdio: "ignore",
    });
    if (!(await waitForServer(base))) {
      server.kill();
      console.error("verify-viz: preview 서버가 안 떴다.");
      process.exit(2);
    }
  }
  console.log(`verify-viz: ${base} 검사\n`);

  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });

  const overflows: Overflow[] = [];
  let figures = 0;
  let checked = 0;

  for (const slug of slugs) {
    const url = `${base.replace(/\/$/, "")}/posts/${slug}/`;
    const res = await page.goto(url, { waitUntil: "networkidle" }).catch(() => null);
    if (!res || !res.ok()) {
      console.log(`  skip  ${slug} (HTTP ${res?.status() ?? "unreachable"})`);
      continue;
    }
    checked++;
    const found = await page.evaluate((tol) => {
      const out: Array<Omit<Overflow, "slug">> = [];
      let count = 0;
      document.querySelectorAll("figure.viz-figure svg").forEach((svg, fi) => {
        count++;
        const el = svg as SVGSVGElement;
        const vb = el.viewBox.baseVal;
        const pattern =
          el.querySelector("[data-bbangto-viz-pattern]")?.getAttribute("data-bbangto-viz-pattern") ??
          el.getAttribute("data-bbangto-viz-pattern") ??
          "?";
        const boxes: Array<{ g: Element; x: number; y: number; w: number; h: number }> = [];
        el.querySelectorAll('rect[data-viz-part="shape"]').forEach((r) => {
          const p = r.parentElement;
          if (!p) return;
          boxes.push({
            g: p,
            x: +(r.getAttribute("x") ?? 0),
            y: +(r.getAttribute("y") ?? 0),
            w: +(r.getAttribute("width") ?? 0),
            h: +(r.getAttribute("height") ?? 0),
          });
        });
        el.querySelectorAll("text").forEach((t) => {
          let bb: DOMRect;
          try {
            bb = (t as SVGTextElement).getBBox();
          } catch {
            return;
          }
          const text = (t.textContent ?? "").trim();
          if (!text) return;
          const owner = boxes.find((b) => b.g.contains(t));
          // 상자 "안"에 놓인 글만 상자로 잰다 — 상자 아래 가운데 정렬 캡션은 설계상 밖이다.
          const insideBox =
            owner && bb.y >= owner.y - tol && bb.y + bb.height <= owner.y + owner.h + tol;
          if (owner && insideBox) {
            const over = Math.max(
              bb.x + bb.width - (owner.x + owner.w),
              owner.x - bb.x,
              bb.y + bb.height - (owner.y + owner.h),
            );
            if (over > tol) {
              out.push({
                fig: fi + 1,
                pattern,
                scope: "box",
                over: Math.round(over),
                boxW: Math.round(owner.w),
                textW: Math.round(bb.width),
                text,
              });
              return;
            }
          }
          const over = Math.max(bb.x + bb.width - (vb.x + vb.width), vb.x - bb.x);
          if (over > tol) {
            out.push({
              fig: fi + 1,
              pattern,
              scope: "viewBox",
              over: Math.round(over),
              boxW: Math.round(vb.width),
              textW: Math.round(bb.width),
              text,
            });
          }
        });
      });
      return { out, count };
    }, TOLERANCE);

    figures += found.count;
    for (const o of found.out) overflows.push({ slug, ...o });
    const mark = found.out.length ? "FAIL " : "  ok ";
    console.log(`${mark}  ${slug}  (figure ${found.count}${found.out.length ? `, 넘침 ${found.out.length}` : ""})`);
  }

  await browser.close();
  if (server) server.kill();

  console.log(`\n글 ${checked}편 / figure ${figures}개 검사.`);

  if (overflows.length) {
    console.error(`\n✗ 텍스트 넘침 ${overflows.length}건 — 그림에서 글자가 잘려 렌더된다.\n`);
    for (const o of overflows) {
      console.error(
        `  ${o.slug} figure#${o.fig} [${o.pattern}] ${o.scope} +${o.over}px ` +
          `(상자 ${o.boxW} / 글 ${o.textW})\n      "${o.text.slice(0, 60)}"`,
      );
    }
    console.error(
      `\n  고치는 법: 해당 kind 가 로컬 구현(src/lib/viz/)인지 확인하고,` +
        `\n  패키지 구현이면 줄바꿈하는 로컬 kind 로 옮기거나 명세의 텍스트를 줄여라.` +
        `\n  (배경은 .claude/skills/make-image/assets/IMAGE_GUIDE.md R6)`,
    );
    process.exit(1);
  }

  console.log("✓ 텍스트 넘침 없음.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
