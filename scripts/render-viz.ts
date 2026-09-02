#!/usr/bin/env bun
/**
 * render-viz — bbangto-ui-visualization 컴포넌트를 래스터(webp)로 굽는다.
 *
 * hero / OG / 썸네일처럼 "실제 이미지 파일"이 필요한 자리에서 쓴다.
 * 본문 인라인 다이어그램은 래스터가 필요 없다(그건 apply-viz가 SSR 인라인 SVG로 처리).
 *
 * 파이프라인: React 컴포넌트 → react-dom/server(renderToStaticMarkup)
 *   → contract shim(src/styles/viz.css) + 폰트 인라인한 HTML 문서
 *   → Playwright(chromium) 스크린샷(PNG) → cwebp/sharp 로 webp.
 *
 * 사용:
 *   bun scripts/render-viz.ts --spec '<viz-json>' --out public/images/<slug>/hero.webp [--force]
 *
 * 사전 요건(발행 시점 로컬): playwright chromium + cwebp(libwebp) 또는 sharp.
 *   CI(astro build)는 커밋된 webp만 소비하므로 이 스크립트를 실행하지 않는다.
 */
import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  VisualizationStyleGuideProvider,
  ProcessSteps,
  Comparison,
  Flowchart,
  Statistics,
  PosterEditorial,
} from "@centurio1987/bbangto-ui-visualization";
import PosterHero from "../src/lib/viz/PosterHero";
import { blogVizStyleGuide } from "../src/lib/viz/blogVizStyleGuide";
import { parseVizSpec, type VizSpec } from "../src/lib/viz/schema";
import { defaultViewBox, a11yText, extraProps, pixelSize } from "../src/lib/viz/layout";

const ROOT = process.cwd();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const KIND: Record<VizSpec["kind"], any> = {
  ProcessSteps,
  Comparison,
  Flowchart,
  Statistics,
  PosterEditorial,
  PosterHero,
};

/**
 * 래스터라이저의 서체 선언 — **`BaseLayout.astro` 의 것과 같은 집합이어야 한다** (KAN-080 S7).
 *
 * 여기가 갈려 있었다: Jua·Gaegu 가 없고 JetBrains Mono 700 이 있었다. 갈리면 같은 그림이
 * 지면과 래스터에서 다른 얼굴로 나오는데, hero 는 굽고 나면 굳어서 **되돌릴 방법이 없다.**
 *
 * Gowun Dodum 은 구글에서 안 받는다 — 자체 호스팅 3단을 **base64 로 박아 넣는다.**
 * Playwright 가 `setContent` 로 띄우는 문서는 출처가 `about:blank` 라 `file://` 폰트를 못 받고,
 * 구글에서 받으면 400 한 종뿐이라 §5 가 규정한 700 이 다시 **합성**이 된다. 그러면 이 카드가
 * 고친 결함이 hero 에서만 그대로 남는다.
 */
const GOOGLE_FONTS =
  "@import url('https://fonts.googleapis.com/css2?family=Jua&family=Space+Mono:wght@400;700&family=Gaegu:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap');";

const SELF_HOSTED_WEIGHTS = [400, 500, 700] as const;

async function fontFaces(): Promise<string> {
  const out: string[] = [];
  for (const w of SELF_HOSTED_WEIGHTS) {
    const file = join(ROOT, "public", "fonts", `gowun-dodum-${w}.woff2`);
    if (!existsSync(file)) {
      throw new Error(
        `자체 호스팅 서체가 없다 — ${file}. \`bun run build && bun run fonts:build\` 를 먼저 돌려라. ` +
        `구글 폴백으로 조용히 넘어가지 않는다: 그쪽은 400 한 종이라 700 이 합성으로 굳는다.`,
      );
    }
    const b64 = (await readFile(file)).toString("base64");
    out.push(
      `@font-face{font-family:'Gowun Dodum';font-style:normal;font-weight:${w};` +
      `src:url(data:font/woff2;base64,${b64}) format('woff2')}`,
    );
  }
  // 굵기 합성을 끈다 — 지면과 같은 규약이다(global.css 의 html 규칙). 기울기는 남긴다.
  out.push("html{font-synthesis:style}");
  return out.join("\n");
}

/** viz 컴포넌트 트리 → 전체 HTML 문서(shim + 폰트 + 사이즈). */
async function buildHtml(spec: VizSpec): Promise<{ html: string; w: number; h: number }> {
  const { title, desc } = a11yText(spec);
  const vb = defaultViewBox(spec);
  const { w, h } = pixelSize(spec as VizSpec & { size?: { w: number; h: number } });

  const child = React.createElement(KIND[spec.kind], {
    accessible: "img",
    title,
    desc,
    viewBox: vb,
    width: "100%",
    height: "100%",
    ...extraProps(spec),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: spec.data as any,
  });
  const tree = React.createElement(VisualizationStyleGuideProvider, {
    styleGuide: blogVizStyleGuide,
    children: child,
  });
  const markup = renderToStaticMarkup(tree);

  // contract shim 을 파일에서 읽어 단일 소스 유지
  const shim = await readFile(join(ROOT, "src", "styles", "viz.css"), "utf8");

  const fonts = await fontFaces();

  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<style>${GOOGLE_FONTS}
${fonts}
*{margin:0;padding:0;box-sizing:border-box}
html,body{background:transparent}
/* 높이는 **고정하지 않는다** — 폭만 맞추고 SVG 의 고유 비율을 따르게 둔다.
   일부 로컬 kind(Comparison·ProcessSteps)는 viewBox 높이를 콘텐츠에서 되뽑으므로,
   저작 viewBox 로 계산한 ${h}px 에 가두면 preserveAspectRatio 가 letterbox 를
   만들어 위아래에 빈 띠가 낀다. hero(PosterHero)는 viewBox 가 고정이라 결과가 같다. */
#capture{width:${w}px;overflow:hidden}
#capture svg{display:block;width:100%;height:auto}
${shim}
</style></head><body><div id="capture">${markup}</div></body></html>`;
  return { html, w, h };
}

/** PNG 버퍼 → webp 파일 (cwebp 우선, 없으면 sharp). */
async function pngToWebp(png: Buffer, out: string, quality = 82): Promise<void> {
  await mkdir(dirname(out), { recursive: true });
  // 1) cwebp CLI
  try {
    const tmp = join(tmpdir(), `viz-${process.pid}-${Date.now()}.png`);
    await writeFile(tmp, png);
    execFileSync("cwebp", ["-quiet", "-q", String(quality), tmp, "-o", out]);
    await unlink(tmp).catch(() => {});
    if (existsSync(out)) return;
  } catch {
    /* fall through to sharp */
  }
  // 2) sharp fallback
  try {
    const sharp = (await import("sharp")).default;
    await sharp(png).webp({ quality }).toFile(out);
    return;
  } catch (e) {
    throw new Error(
      `webp 변환 실패 — cwebp(libwebp) 또는 sharp 필요. cwebp 설치: brew install webp. (${(e as Error).message})`,
    );
  }
}

/** viz 스펙을 webp 로 래스터. 이미 있으면(force 아니면) skip. */
export async function rasterizeViz(
  spec: VizSpec,
  outPath: string,
  opts: { force?: boolean } = {},
): Promise<string> {
  if (!opts.force && existsSync(outPath)) return outPath;

  let chromium: typeof import("playwright").chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    throw new Error(
      "playwright 미설치. 설치: `bun add -d playwright && bunx playwright install chromium`",
    );
  }

  const { html } = await buildHtml(spec);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.evaluate(() => (document as unknown as { fonts?: { ready?: Promise<unknown> } }).fonts?.ready).catch(() => {});
    await page.waitForTimeout(150);
    const el = await page.$("#capture");
    if (!el) throw new Error("#capture 렌더 실패");
    const png = await el.screenshot({ type: "png" });
    await pngToWebp(Buffer.from(png), outPath);
    return outPath;
  } finally {
    await browser.close();
  }
}

// ---------- CLI ----------
function parseArgs(argv: string[]) {
  const a: { spec?: string; specFile?: string; out?: string; force: boolean } = { force: false };
  for (let i = 2; i < argv.length; i++) {
    const t = argv[i];
    if (t === "--force") a.force = true;
    else if (t === "--spec") a.spec = argv[++i];
    else if (t === "--spec-file") a.specFile = argv[++i];
    else if (t === "--out") a.out = argv[++i];
  }
  return a;
}

if (import.meta.main) {
  const args = parseArgs(process.argv);
  if (!args.out) {
    console.error("usage: bun scripts/render-viz.ts --spec '<json>' --out <path.webp> [--force]");
    process.exit(1);
  }
  if (!args.force && existsSync(args.out)) {
    console.log(`exists (skip, use --force): ${args.out}`);
    process.exit(0);
  }
  let raw = args.spec;
  if (!raw && args.specFile) raw = await readFile(args.specFile, "utf8");
  if (!raw) {
    console.error("missing --spec '<json>' or --spec-file <path>");
    process.exit(1);
  }
  let spec: VizSpec;
  try {
    spec = parseVizSpec(JSON.parse(raw), "render-viz spec");
  } catch (e) {
    console.error((e as Error).message);
    process.exit(1);
  }
  try {
    const outPath = await rasterizeViz(spec, args.out, { force: args.force });
    console.log(outPath);
  } catch (e) {
    console.error((e as Error).message);
    process.exit(3);
  }
}
