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
 * **(D) 단색 배경 + 접지 그림자 3D 렌더** (`--bg-tol` + `--shadow-floor`)
 *     tony-fullbody-master.webp 같은 렌더는 (A)로 오리면 두 군데서 깨진다:
 *       ① 흰 배가 뜯긴다 — 엉덩이 림라이트(sat 25 · r−b 25)가 isPaper 를 통과해서,
 *          fill 이 실루엣 가장자리에서 배 경계까지 저채도 통로를 타고 들어온다.
 *       ② 발밑 접지 그림자가 캐릭터와 한 덩어리로 남는다(안쪽 옅은 부분이 짙은 테두리에
 *          갇혀 fill 이 못 닿는다). 다이컷 흰 테두리가 그 얼룩까지 감싸버린다.
 *     그래서 (D)는 배경 판정을 두 단계로 쪼갠다:
 *       1단계 `--bg-tol` — 테두리 색에서 ±tol 인 **납작한 배경만** 채운다. 렌더 배경은
 *              노이즈가 거의 없으니(이 마스터는 테두리 편차 최대 3.8) tol 도 그만큼 좁게
 *              잡는다. **넓히면 흰 털이 배경으로 넘어간다** — tol 4→10 하나로 중성 흰색
 *              78,923px 이 배경 후보가 되고, 그게 귀·볼·배를 갉아먹는다.
 *       2단계 `--shadow-floor <y>` — 그 행부터 아래에서만 접지 그림자를 배경에 이어 붙인다.
 *
 *     **그림자와 털은 색으로 못 가른다.** 배경 위에 옅게 얹힌 분홍 털(=실루엣 가장자리
 *     블렌드)과 배경을 눌러 어둡게 만든 그림자는 채도·명도·색상비가 전부 겹친다(실측:
 *     털 블렌드 250,226,221 → 채도 29 · 채널비 편차 0.047 / 그림자 224,203,194 → 채도 30 ·
 *     편차 0.047. 같다). 그래서 2단계는 색이 아니라 **기하**로 가른다 — 띠 안에서 배경은
 *     "채도 `--core-sat` 이상인 코어에서 `--rim` 밖"인 픽셀이다. 띠 아래에 있는 캐릭터는
 *     고채도 분홍 다리뿐이라 코어가 곧 다리이고, 털 림은 코어에 붙어 있으니 살아남고,
 *     바닥에 퍼진 그림자는 코어에서 멀어 지워진다. 채도 문턱만으로 자르면 이 림(다리
 *     좌측 10px)이 같이 깎여 floor 행에 계단이 생긴다.
 *
 *     floor 는 **흰 배 아래 · 그림자가 실루엣 밖으로 번지기 시작하는 행 위**로 잡는다
 *     (이 마스터: 배 1022 · 번짐 1028 → 1026). 원본이 바뀌면 다시 재야 한다.
 *
 * 사용:
 *   bun scripts/extract-author-cutout.ts --src public/tony-deco.webp \
 *     --out public/images/authors/tony-full.webp [--height 440] [--force]
 *   # (D) 마스코트 다이컷 — 값의 근거는 design-concept/DECO_KIT.md 자산 절
 *   bun scripts/extract-author-cutout.ts --src design-concept/authors/tony-fullbody-master.webp \
 *     --out public/images/deco/tony-diecut.webp --height 904 \
 *     --bg-tol 4 --shadow-floor 1026 --force
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
  /** (D) 단색 배경 허용 오차. 주면 자동 판정을 건너뛰고 (C)/(D) 경로로 간다. */
  bgTol?: number;
  /** (D) 이 행부터 아래는 "다리 + 바닥 그림자"뿐인 구간 */
  shadowFloor?: number;
  /** (D) 캐릭터 코어로 볼 채도 하한 */
  coreSat: number;
  /** (D) 코어를 이만큼 넓힌 자리는 털 림으로 보고 지키지 않는다 [가로, 세로] */
  rim: [number, number];
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
      "사용: bun scripts/extract-author-cutout.ts --src <원본> --out <결과.webp> [--height 440] [--force]\n" +
        "      [--bg-tol N] [--shadow-floor Y] [--core-sat N] [--rim RX,RY]" +
        "   ← (D) 단색 배경 + 접지 그림자",
    );
    process.exit(1);
  }
  const num = (flag: string) => {
    const v = get(flag);
    return v === undefined ? undefined : Number(v);
  };
  const rimArg = get("--rim");
  const rim = rimArg?.split(",").map(Number) ?? [];
  return {
    src,
    out,
    height: Number(get("--height") ?? 440),
    force: argv.includes("--force"),
    bgTol: num("--bg-tol"),
    shadowFloor: num("--shadow-floor"),
    coreSat: num("--core-sat") ?? 50,
    rim: [rim[0] ?? 10, rim[1] ?? rim[0] ?? 4],
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

/** 마스크를 가로 rx · 세로 ry 로 팽창(분리형 최대 필터). r 이 작아 창을 그대로 훑는다. */
function dilate(
  src: Uint8Array,
  W: number,
  H: number,
  rx: number,
  ry: number,
): Uint8Array {
  const mid = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    const row = y * W;
    for (let x = 0; x < W; x++) {
      let v = src[row + x];
      for (let d = 1; d <= rx && !v; d++) {
        if (x - d >= 0 && src[row + x - d]) v = 1;
        if (x + d < W && src[row + x + d]) v = 1;
      }
      mid[row + x] = v;
    }
  }
  const out = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let v = mid[y * W + x];
      for (let d = 1; d <= ry && !v; d++) {
        if (y - d >= 0 && mid[(y - d) * W + x]) v = 1;
        if (y + d < H && mid[(y + d) * W + x]) v = 1;
      }
      out[y * W + x] = v;
    }
  }
  return out;
}

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
 * (C) 단색(보통 흰색) 배경 컷 · (D) 거기에 접지 그림자까지.
 *
 * 기본 허용 오차를 좁게 잡는 이유 — 캐릭터의 흰 볼털이 흰 배경과 맞닿아 있어서,
 * 넉넉하게 잡으면 fill이 털 속으로 새어 들어가 얼굴이 뚫린다.
 * `floor` 를 주면 그 행부터 아래에서 접지 그림자를 배경에 이어 붙인다((D)).
 *
 * 그림자 판정이 색이 아니라 기하인 이유는 파일 머리에 적어뒀다 — 요약하면 옅게 얹힌
 * 털과 배경을 누른 그림자는 색이 같다. 그래서 **채도 코어(= 띠 아래에서는 분홍 다리)를
 * rim 만큼 넓힌 영역**을 캐릭터로 지키고, 그 밖의 것만 그림자로 본다.
 */
function cutOutFromSolidBg(
  buf: Buffer,
  W: number,
  H: number,
  bg: [number, number, number],
  tol = 4,
  floor?: number,
  coreSat = 50,
  rim: [number, number] = [10, 4],
): Extraction {
  const nearBg = (r: number, g: number, b: number) =>
    Math.abs(r - bg[0]) <= tol &&
    Math.abs(g - bg[1]) <= tol &&
    Math.abs(b - bg[2]) <= tol;

  let nearCore: Uint8Array | null = null;
  if (floor !== undefined) {
    const core = new Uint8Array(W * H);
    for (let p = 0; p < W * H; p++) {
      const i = p * 4;
      const max = Math.max(buf[i], buf[i + 1], buf[i + 2]);
      const min = Math.min(buf[i], buf[i + 1], buf[i + 2]);
      core[p] = max - min >= coreSat ? 1 : 0;
    }
    nearCore = dilate(core, W, H, rim[0], rim[1]);
  }

  return cutOutByFloodFill(
    buf,
    W,
    H,
    (r, g, b, x, y) =>
      nearBg(r, g, b) ||
      (nearCore !== null && y >= floor! && !nearCore[y * W + x]),
    `단색 배경(rgb ${bg.map((c) => Math.round(c)).join(",")}, ±${tol}) 제거` +
      (floor !== undefined
        ? ` + y≥${floor} 접지 그림자 제거(채도 ≥${coreSat} 코어에서 ${rim[0]}×${rim[1]}px 밖)`
        : ""),
  );
}

/** 테두리에서 배경을 flood fill 하고, 남은 최대 연결 컴포넌트만 캐릭터로 남긴다. */
function cutOutByFloodFill(
  buf: Buffer,
  W: number,
  H: number,
  isBackground: (
    r: number,
    g: number,
    b: number,
    x: number,
    y: number,
  ) => boolean,
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
    const x = p % W;
    if (!isBackground(buf[i], buf[i + 1], buf[i + 2], x, (p - x) / W)) continue;
    mask[p] = BG;
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

const { src, out, height, force, bgTol, shadowFloor, coreSat, rim } =
  parseArgs(process.argv.slice(2));

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

/**
 * `--bg-tol` 은 자동 판정을 덮는다 — (D) 원본은 배경이 **종이색**이라 자동으로는 (A)로
 * 가는데, (A)가 이 렌더에서 깨지는 이유는 파일 머리에 적어뒀다.
 */
if (bgTol !== undefined && !borderColor) {
  console.error(
    "--bg-tol 을 줬지만 테두리 색이 균일하지 않다 — 단색 배경 원본이 아니다.",
  );
  process.exit(1);
}
const forcedBg = bgTol !== undefined ? borderColor : null;

const { box, coverage, note } = isTransparent
  ? boxFromAlpha(buf, W, H) //             (B) 이미 투명
  : forcedBg
    ? cutOutFromSolidBg(buf, W, H, forcedBg, bgTol, shadowFloor, coreSat, rim) // (D)
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
