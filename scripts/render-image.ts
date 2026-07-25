#!/usr/bin/env bun
// ⚠️ DEPRECATED (KAN-013) — HTML 템플릿 5종 래스터 경로는 은퇴했다.
//   구조형 시각물은 이제 @centurio1987/bbangto-ui-visualization 컴포넌트로 구현한다:
//   scripts/apply-viz.ts (inline SSR SVG) + scripts/render-viz.ts (hero webp).
//   이 파일과 image-templates.ts 는 롤백 유예용으로만 남아 있고 파이프라인에서 호출되지 않는다. 후속 커밋에서 삭제 예정.
//
// (레거시) 구조형 이미지 렌더러: HTML(template) → Playwright(chromium) → PNG.
// 사용법:
//   bun run scripts/render-image.ts --spec '<json>' --out public/images/<slug>/<name>.png
//   bun run scripts/render-image.ts --spec-file spec.json --out <path>
// spec(JSON): { "type": "step-diagram", "name": "...", "alt": "...", ...templateData }
// 가이드: .claude/skills/make-image/assets/IMAGE_GUIDE.md
//
// 사전 요건: bun add -d playwright && bunx playwright install chromium
//   (미설치 시 친절한 안내 후 종료코드 3 — 호출자가 hard fail/skip 판단)

import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname } from "node:path";
import { renderTemplate } from "./image-templates";

function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
      out[key] = val;
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const out = args.out;
if (!out) {
  console.error("missing --out <output-path>");
  process.exit(1);
}
if (args.force === undefined && existsSync(out)) {
  // 멱등: 이미 있으면 재생성하지 않는다(가이드 규칙).
  console.log(`exists (skip, use --force to overwrite): ${out}`);
  process.exit(0);
}

let specRaw = args.spec;
if (!specRaw && args["spec-file"]) {
  specRaw = await readFile(args["spec-file"], "utf8");
}
if (!specRaw) {
  console.error("missing --spec '<json>' or --spec-file <path>");
  process.exit(1);
}

let spec: Record<string, unknown>;
try {
  spec = JSON.parse(specRaw);
} catch (e) {
  console.error(`invalid spec JSON: ${(e as Error).message}`);
  process.exit(1);
}

const type = String(spec.type ?? "");
let html: string;
try {
  html = renderTemplate(type, spec);
} catch (e) {
  console.error((e as Error).message);
  process.exit(1);
}

// Playwright는 선택 의존성 — 없으면 친절히 안내(종료코드 3).
let chromium: typeof import("playwright").chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error(
    "playwright 미설치. 설치: `bun add -d playwright && bunx playwright install chromium`",
  );
  process.exit(3);
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: "networkidle" });
  // FOUT 방지: 웹폰트 페인팅 완료까지 대기(타임아웃 가드).
  await page
    .evaluate(() => (document as any).fonts?.ready)
    .catch(() => {});
  await page.waitForTimeout(150);

  const el = await page.$("#capture");
  if (!el) throw new Error("template did not render #capture");

  await mkdir(dirname(out), { recursive: true });
  await el.screenshot({ path: out, type: out.endsWith(".png") ? "png" : undefined });
  console.log(out);
} finally {
  await browser.close();
}
