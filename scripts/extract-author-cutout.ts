#!/usr/bin/env bun
/**
 * extract-author-cutout — 저자 데코 일러스트에서 캐릭터만 오려낸 투명 배경 webp를 굽는다.
 *
 * 저자 원본(예: public/tony-deco.webp)은 모눈 종이 배경 + 말풍선 + 낙서 + 이름표가
 * 함께 그려진 "장식 컷"이라, 푸터 라인업처럼 캐릭터만 세워야 하는 자리에는 그대로 못 쓴다.
 * 이 스크립트가 배경/장식을 지우고 캐릭터 전신만 남긴 컷아웃을 만든다.
 *
 * 알고리즘:
 *   ① 테두리에서 "종이색" flood fill → 배경 마스크 (낙서·말풍선은 색이 달라 fill이 막힌다)
 *   ② 배경이 아닌 픽셀들을 연결 컴포넌트로 라벨링 → **가장 큰 덩어리 = 캐릭터**
 *      (말풍선·별·하트·이름표는 캐릭터와 떨어진 작은 섬이라 자동으로 탈락)
 *   ③ 나머지 알파 0 → 바운딩 박스로 크롭 → 지정 높이로 축소(이때 계단 알파가 부드러워진다)
 *
 * 사용:
 *   bun scripts/extract-author-cutout.ts --src public/tony-deco.webp \
 *     --out public/images/authors/tony-full.webp [--height 440] [--force]
 *
 * 원본(마스터)이 사는 곳: 사이트가 직접 참조하는 원본은 public/(예: public/tony-deco.webp,
 * public/images/authors/ppangto-teacher.webp)에 있고, 컷아웃 재생성용으로만 보관하는 원본은
 * 배포 산출물을 불리지 않도록 design-concept/authors/에 둔다.
 *
 * 새 저자 전신샷이 생기면 같은 화풍(캐릭터가 화면에서 가장 큰 덩어리, 종이색 배경)이라는
 * 전제 아래 이 명령만 다시 돌리면 된다. 결과 webp는 커밋한다(빌드는 이 스크립트를 안 돈다).
 */
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, basename } from "node:path";
import sharp from "sharp";

interface Args {
  src: string;
  out: string;
  height: number;
  force: boolean;
}

function parseArgs(argv: string[]): Args {
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i === -1 ? undefined : argv[i + 1];
  };
  const src = get("--src");
  const out = get("--out");
  if (!src || !out) {
    console.error(
      "사용: bun scripts/extract-author-cutout.ts --src <원본> --out <결과.webp> [--height 440] [--force]",
    );
    process.exit(1);
  }
  return {
    src,
    out,
    height: Number(get("--height") ?? 440),
    force: argv.includes("--force"),
  };
}

/**
 * 종이 배경 판정. 원본들은 따뜻한 베이지 모눈지(#F3EEE4 근방)이고,
 * 캐릭터는 순백에 가까운 스티커 외곽선을 두르고 있어 밝기·채도로 갈린다.
 */
function isPaper(r: number, g: number, b: number): boolean {
  const maxc = Math.max(r, g, b);
  const minc = Math.min(r, g, b);
  const sat = maxc - minc;
  const bright = (r + g + b) / 3;
  if (bright > 246 && sat < 8) return false; // 순백 = 캐릭터 스티커 외곽선
  return bright > 200 && bright < 250 && sat >= 6 && sat <= 40 && r >= g && g >= b;
}

const { src, out, height, force } = parseArgs(process.argv.slice(2));

if (!existsSync(src)) {
  console.error(`원본이 없다: ${src}`);
  process.exit(1);
}
if (existsSync(out) && !force) {
  console.error(`이미 있다: ${out} (덮어쓰려면 --force)`);
  process.exit(1);
}

const image = sharp(src).ensureAlpha();
const meta = await image.metadata();
const W = meta.width!;
const H = meta.height!;
const buf = await image.raw().toBuffer();

// ① 테두리에서 종이색 flood fill
const BG = 1;
const mask = new Uint8Array(W * H);
const stack: number[] = [];
for (let x = 0; x < W; x++) {
  stack.push(x, (H - 1) * W + x);
}
for (let y = 0; y < H; y++) {
  stack.push(y * W, y * W + W - 1);
}
while (stack.length) {
  const p = stack.pop()!;
  if (mask[p] === BG) continue;
  const i = p * 4;
  if (!isPaper(buf[i], buf[i + 1], buf[i + 2])) continue;
  mask[p] = BG;
  const x = p % W;
  if (x > 0) stack.push(p - 1);
  if (x < W - 1) stack.push(p + 1);
  if (p >= W) stack.push(p - W);
  if (p < W * (H - 1)) stack.push(p + W);
}

// ② 남은 전경 픽셀의 연결 컴포넌트 중 최대 덩어리 = 캐릭터
const label = new Int32Array(W * H).fill(-1);
let components = 0;
let best = -1;
let bestSize = 0;
let box = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
for (let seed = 0; seed < W * H; seed++) {
  if (mask[seed] === BG || label[seed] !== -1) continue;
  const id = components++;
  label[seed] = id;
  const queue = [seed];
  let size = 0;
  let minX = W,
    maxX = 0,
    minY = H,
    maxY = 0;
  while (queue.length) {
    const p = queue.pop()!;
    size++;
    const x = p % W;
    const y = (p - x) / W;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    const neighbors = [
      x > 0 ? p - 1 : -1,
      x < W - 1 ? p + 1 : -1,
      p >= W ? p - W : -1,
      p < W * (H - 1) ? p + W : -1,
    ];
    for (const np of neighbors) {
      if (np < 0 || mask[np] === BG || label[np] !== -1) continue;
      label[np] = id;
      queue.push(np);
    }
  }
  if (size > bestSize) {
    bestSize = size;
    best = id;
    box = { minX, maxX, minY, maxY };
  }
}

if (best === -1) {
  console.error("캐릭터 덩어리를 못 찾았다 — 원본 배경이 종이색이 맞는지 확인할 것.");
  process.exit(1);
}

// 캐릭터가 화면의 극히 일부라면 배경 판정이 틀린 것 → 조용히 이상한 결과를 내지 않는다
const coverage = bestSize / (W * H);
if (coverage < 0.05) {
  console.error(
    `가장 큰 덩어리가 화면의 ${(coverage * 100).toFixed(1)}%뿐이다 — 캐릭터 추출 실패로 본다.`,
  );
  process.exit(1);
}

// ③ 알파 적용 → 크롭 → 축소
for (let p = 0; p < W * H; p++) {
  if (label[p] !== best) buf[p * 4 + 3] = 0;
}

const pad = 4;
const left = Math.max(0, box.minX - pad);
const top = Math.max(0, box.minY - pad);
const width = Math.min(W - left, box.maxX - box.minX + 1 + pad * 2);
const cropH = Math.min(H - top, box.maxY - box.minY + 1 + pad * 2);

await mkdir(dirname(out), { recursive: true });
await sharp(buf, { raw: { width: W, height: H, channels: 4 } })
  .extract({ left, top, width, height: cropH })
  .resize({ height, fit: "inside", withoutEnlargement: true })
  .webp({ quality: 86, effort: 6, alphaQuality: 100 })
  .toFile(out);

const result = await sharp(out).metadata();
console.log(
  `${basename(src)} ${W}×${H} → ${out} ${result.width}×${result.height}` +
    ` (덩어리 ${components}개 중 ${(coverage * 100).toFixed(1)}% 채택)`,
);
