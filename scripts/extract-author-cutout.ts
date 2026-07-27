#!/usr/bin/env bun
/**
 * extract-author-cutout — 저자 일러스트에서 캐릭터 전신만 남긴 투명 배경 webp를 굽는다.
 *
 * 원본은 두 종류가 들어온다. **테두리 알파를 보고 스스로 갈라진다.**
 *
 * (A) 데코 컷 — 모눈 종이 배경 + 말풍선 + 낙서 + 이름표가 함께 그려진 그림
 *     (예: public/tony-deco.webp). 그대로는 라인업에 못 세우므로 배경/장식을 지운다:
 *   ① 테두리에서 "종이색" flood fill → 배경 마스크 (낙서·말풍선은 색이 달라 fill이 막힌다)
 *   ② 배경이 아닌 픽셀들을 연결 컴포넌트로 라벨링 → **가장 큰 덩어리 = 캐릭터**
 *      (말풍선·별·하트·이름표는 캐릭터와 떨어진 작은 섬이라 자동으로 탈락)
 *   ③ 나머지 알파 0
 *
 * (B) 이미 배경이 투명한 컷 — 알파 PNG로 뽑아온 그림. 지울 배경이 없으므로 오리지 않고
 *     알파 임계값으로 바운딩 박스만 잡는다. 임계값(ALPHA_MIN)이 발밑 옅은 그림자를 걸러내
 *     라인업의 바닥선이 캐릭터 발끝에 맞는다(그림자까지 담으면 혼자 붕 뜬다).
 *
 * 공통: 바운딩 박스로 크롭 → 지정 높이로 축소(이때 (A)의 계단 알파도 부드러워진다)
 *
 * 사용:
 *   bun scripts/extract-author-cutout.ts --src public/tony-deco.webp \
 *     --out public/images/authors/tony-full.webp [--height 440] [--force]
 *
 * 원본(마스터)이 사는 곳: 사이트가 직접 참조하는 원본은 public/(예: public/tony-deco.webp,
 * public/images/authors/ppangto-teacher.webp)에 있고, 컷아웃 재생성용으로만 보관하는 원본은
 * 배포 산출물을 불리지 않도록 design-concept/authors/에 둔다.
 *
 * 새 저자 전신샷이 생기면 이 명령만 다시 돌리면 된다. 결과 webp는 커밋한다
 * (astro build는 이 스크립트를 돌지 않고 커밋된 webp만 소비한다).
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
 * 종이 배경 판정. 데코 컷의 배경은 따뜻한 베이지 모눈지(#F3EEE4 근방)다.
 *
 * 밝기만으로는 못 가른다 — 흰 실험복 같은 밝은 의상이 종이와 밝기가 겹친다(둘 다 230대).
 * 가르는 건 **따뜻함(r−b)**이다. 실측: 종이 243,235,228(r−b=15) · 격자선 232,227,217(r−b=15)
 * · 흰 가운 238,234,235(r−b=3) · 234,227,227(r−b=7). 종이·격자선은 파랑이 확실히 죽어 있고
 * 의상의 흰색은 중성이라, r−b 하한이 배경만 통과시킨다(격자선도 같은 색조라 함께 지워진다).
 */
function isPaper(r: number, g: number, b: number): boolean {
  const sat = Math.max(r, g, b) - Math.min(r, g, b);
  const bright = (r + g + b) / 3;
  if (bright > 246 && sat < 8) return false; // 순백 = 캐릭터 스티커 외곽선
  return (
    bright > 200 &&
    bright < 250 &&
    sat >= 10 &&
    sat <= 40 &&
    r - b >= 10 && // ← 따뜻함. 중성색 흰 의상을 배경으로 오인하지 않게 막는 선
    r >= g &&
    g >= b
  );
}

interface Box {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface Extraction {
  box: Box;
  /** 캐릭터가 차지한 화면 비율 — 배경 판정이 틀렸는지 가늠하는 지표 */
  coverage: number;
  note: string;
}

/** 알파가 이만큼은 돼야 "캐릭터 픽셀". 발밑 옅은 그림자를 걸러내는 문턱이기도 하다. */
const ALPHA_MIN = 8;

/** 테두리 한 줄이 대부분 투명하면 (B) 이미 오려진 원본으로 본다. */
function borderIsTransparent(buf: Buffer, W: number, H: number): boolean {
  let opaque = 0;
  let total = 0;
  const check = (p: number) => {
    total++;
    if (buf[p * 4 + 3] >= ALPHA_MIN) opaque++;
  };
  for (let x = 0; x < W; x++) {
    check(x);
    check((H - 1) * W + x);
  }
  for (let y = 0; y < H; y++) {
    check(y * W);
    check(y * W + W - 1);
  }
  return opaque / total < 0.1;
}

/** (B) 이미 투명한 원본: 알파 임계값으로 바운딩 박스만 잡는다(버퍼는 그대로). */
function boxFromAlpha(buf: Buffer, W: number, H: number): Extraction {
  let minX = W;
  let maxX = 0;
  let minY = H;
  let maxY = 0;
  let kept = 0;
  for (let p = 0; p < W * H; p++) {
    if (buf[p * 4 + 3] < ALPHA_MIN) continue;
    kept++;
    const x = p % W;
    const y = (p - x) / W;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  if (kept === 0) {
    console.error("원본이 전부 투명하다 — 캐릭터가 없는 그림으로 본다.");
    process.exit(1);
  }
  return {
    box: { minX, maxX, minY, maxY },
    coverage: kept / (W * H),
    note: "이미 투명 배경 — 알파 바운딩 박스만 적용",
  };
}

/**
 * 테두리가 한 가지 색으로 균일하면 그 색을 돌려준다((C) 단색 배경 판정).
 * 데코 컷은 모눈선 때문에 균일하지 않아 여기서 걸러지고 (A) 경로로 간다.
 */
function uniformBorderColor(
  buf: Buffer,
  W: number,
  H: number,
): [number, number, number] | null {
  const samples: number[] = [];
  for (let x = 0; x < W; x++) {
    samples.push(x, (H - 1) * W + x);
  }
  for (let y = 0; y < H; y++) {
    samples.push(y * W, y * W + W - 1);
  }
  let sr = 0;
  let sg = 0;
  let sb = 0;
  for (const p of samples) {
    sr += buf[p * 4];
    sg += buf[p * 4 + 1];
    sb += buf[p * 4 + 2];
  }
  const mean: [number, number, number] = [
    sr / samples.length,
    sg / samples.length,
    sb / samples.length,
  ];
  let near = 0;
  for (const p of samples) {
    const d = Math.max(
      Math.abs(buf[p * 4] - mean[0]),
      Math.abs(buf[p * 4 + 1] - mean[1]),
      Math.abs(buf[p * 4 + 2] - mean[2]),
    );
    if (d <= 6) near++;
  }
  return near / samples.length >= 0.9 ? mean : null;
}

/** (A) 데코 컷: 종이색 flood fill → 최대 연결 컴포넌트만 남기고 나머지는 알파 0. */
function cutOutFromDeco(buf: Buffer, W: number, H: number): Extraction {
  return cutOutByFloodFill(
    buf,
    W,
    H,
    (r, g, b) => isPaper(r, g, b),
    "데코 배경 제거",
  );
}

/**
 * (C) 단색(보통 흰색) 배경 컷: 테두리 색과 가까운 픽셀만 배경으로 본다.
 * 허용 오차를 좁게 잡는 이유 — 캐릭터의 흰 볼털이 흰 배경과 맞닿아 있어서,
 * 넉넉하게 잡으면 fill이 털 속으로 새어 들어가 얼굴이 뚫린다.
 */
function cutOutFromSolidBg(
  buf: Buffer,
  W: number,
  H: number,
  bg: [number, number, number],
): Extraction {
  const TOL = 4;
  return cutOutByFloodFill(
    buf,
    W,
    H,
    (r, g, b) =>
      Math.abs(r - bg[0]) <= TOL &&
      Math.abs(g - bg[1]) <= TOL &&
      Math.abs(b - bg[2]) <= TOL,
    `단색 배경(rgb ${bg.map((c) => Math.round(c)).join(",")}) 제거`,
  );
}

/** 테두리에서 배경을 flood fill 하고, 남은 최대 연결 컴포넌트만 캐릭터로 남긴다. */
function cutOutByFloodFill(
  buf: Buffer,
  W: number,
  H: number,
  isBackground: (r: number, g: number, b: number) => boolean,
  label0: string,
): Extraction {
  // ① 테두리에서 배경색 flood fill
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
    if (!isBackground(buf[i], buf[i + 1], buf[i + 2])) continue;
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
  let box: Box = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  for (let seed = 0; seed < W * H; seed++) {
    if (mask[seed] === BG || label[seed] !== -1) continue;
    const id = components++;
    label[seed] = id;
    const queue = [seed];
    let size = 0;
    let minX = W;
    let maxX = 0;
    let minY = H;
    let maxY = 0;
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
    console.error("캐릭터 덩어리를 못 찾았다 — 배경 판정이 맞는지 확인할 것.");
    process.exit(1);
  }

  // ③ 캐릭터 외 전부 알파 0
  for (let p = 0; p < W * H; p++) {
    if (label[p] !== best) buf[p * 4 + 3] = 0;
  }

  return {
    box,
    coverage: bestSize / (W * H),
    note: `${label0} — 덩어리 ${components}개 중 최대 1개 채택`,
  };
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

const meta = await sharp(src).metadata();
const W = meta.width!;
const H = meta.height!;
const buf = await sharp(src).ensureAlpha().raw().toBuffer();

const isTransparent = borderIsTransparent(buf, W, H);
const borderColor = isTransparent ? null : uniformBorderColor(buf, W, H);

/**
 * 테두리가 균일해도 그 색이 **종이색이면 (A) 데코 컷**으로 본다.
 * 데코 원본은 가장자리가 매끈해 균일 판정을 통과해버리는데, (C)의 좁은 허용 오차로는
 * 종이 질감을 못 지워서 이름표·마스킹테이프가 캐릭터와 한 덩어리로 남는다.
 * (C)는 종이색 판정이 감당 못 하는 배경(순백 등) 전용이다.
 */
const solidBg =
  borderColor && !isPaper(borderColor[0], borderColor[1], borderColor[2])
    ? borderColor
    : null;

const { box, coverage, note } = isTransparent
  ? boxFromAlpha(buf, W, H) //             (B) 이미 투명
  : solidBg
    ? cutOutFromSolidBg(buf, W, H, solidBg) // (C) 종이색 아닌 단색 배경
    : cutOutFromDeco(buf, W, H); //           (A) 데코 컷

// 캐릭터가 화면의 극히 일부라면 판정이 틀린 것 → 조용히 이상한 결과를 내지 않는다
if (coverage < 0.05) {
  console.error(
    `캐릭터로 잡힌 영역이 화면의 ${(coverage * 100).toFixed(1)}%뿐이다 — 추출 실패로 본다.`,
  );
  process.exit(1);
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
    ` (${note}, 화면의 ${(coverage * 100).toFixed(1)}%)`,
);
