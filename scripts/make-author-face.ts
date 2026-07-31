#!/usr/bin/env bun
/**
 * make-author-face — 저자 전신 마스터에서 **얼굴 샷 아바타**(`AuthorMeta.avatar`)를 굽는다.
 *
 * 프로필 카드(`AuthorProfile.astro`)는 아바타를 104px 원으로 그린다. 전신샷을 그 원에
 * 넣으면 얼굴이 20px 남짓으로 줄어 누가 누군지 안 보인다 — 그래서 네 저자 모두 머리 +
 * 어깨만 잘라 쓴다. **네 장을 한 표에 모아 두는 이유**는 프레이밍이 서로 맞아야 해서다.
 * 한 명만 따로 자르면 목록에서 얼굴 크기가 제각각이 된다.
 *
 * 원본은 **장식 없는 전신 마스터**(`design-concept/authors/<id>-fullbody-master.webp`)다.
 * 데코 컷(모눈 종이 + 말풍선 + 이름표)에서 자르면 아바타마다 배경 낙서가 다르게 걸린다.
 *
 * 배경은 지우고 **투명하게** 내보낸다. `.ap-avatar` 가 이미 `background: var(--paper)` 를
 * 깔고 있어서, 투명한 컷은 어느 지면에서든 그 지면의 종이색 위에 앉는다. 마스터마다
 * 배경색이 다른데(토니 크림 254,248,241 · 나머지 흰색 254,254,254 · 선생님은 이미 투명)
 * 그걸 그대로 두면 원 네 개의 바탕색이 미묘하게 갈린다.
 *
 * **`bgTol` 은 눈대중이 아니라 마스터마다 잰 값이다.** 흰 볼털의 하이라이트가 흰 배경과
 * 같은 값(255,255,255)까지 올라가서, 넓히면 fill 이 볼 속으로 새어 얼굴이 뚫린다
 * (`extract-author-cutout.ts` 머리말의 (D) 절과 같은 함정). 볼 가장자리의 그늘이 fill 을
 * 막아 주는 폭이 곧 안전 한계이므로, 값을 만지면 **512px 결과에서 볼·귀를 확대해 확인**할 것.
 *
 * 실행: bun scripts/make-author-face.ts
 * 출력: public/images/authors/<id>.webp (512×512, 알파)
 *
 * 멱등하다. 마스터를 갈아 끼웠을 때만 다시 돌리고, **끝나면 반드시**
 * `bun scripts/make-author-avatars.ts` 로 `-sm` 사본까지 다시 굽는다(그 스크립트가 이
 * 결과물을 원본으로 삼는다).
 */
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "public/images/authors");
const OUT_SIZE = 512; // 프로필 카드 104px · 목록 아바타 22px 의 여유 있는 상위 배수

interface FaceCrop {
  /** 장식 없는 전신 마스터 (repo 상대경로) */
  master: string;
  /** 마스터 좌표계의 정사각 크롭 — 머리 위 여백 ~ 어깨 윗선 */
  left: number;
  top: number;
  size: number;
  /** 배경 flood fill 허용 오차. 마스터마다 잰 값 — 머리말 참고 */
  bgTol: number;
}

/**
 * 네 저자의 얼굴 자리. `size` 를 비슷하게 두는 게 아니라 **머리가 프레임에서 차지하는
 * 비율**을 맞춘 값이다(마스터마다 캐릭터가 판에서 차지하는 크기가 다르다).
 */
const FACES: Record<string, FaceCrop> = {
  tony: {
    master: "design-concept/authors/tony-fullbody-master.webp",
    left: 330,
    top: 150,
    size: 620,
    bgTol: 4, // DECO_KIT 8절에서 잰 값 — 10으로 넓히면 흰 털이 배경으로 넘어간다
  },
  ppangto: {
    master: "design-concept/authors/ppangto-fullbody-master.webp",
    left: 395,
    top: 120,
    size: 620,
    bgTol: 3,
  },
  "ppangto-prof": {
    master: "design-concept/authors/ppangto-prof-fullbody-master.webp",
    left: 348,
    top: 140,
    size: 600,
    bgTol: 3,
  },
  "ppangto-teacher": {
    master: "design-concept/authors/ppangto-teacher-fullbody-master.webp",
    left: 265,
    top: 200,
    size: 560,
    bgTol: 3, // 이 마스터는 이미 알파가 있어 fill 을 타지 않는다(아래 분기)
  },
};

/** 테두리 한 줄이 대부분 투명하면 지울 배경이 없다 — 마스터가 이미 오려진 컷이다. */
function borderIsTransparent(buf: Buffer, W: number, H: number): boolean {
  let opaque = 0;
  let total = 0;
  const check = (p: number) => {
    total++;
    if (buf[p * 4 + 3] >= 8) opaque++;
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

/** 테두리 픽셀의 평균색 = 배경색. 마스터는 단색 배경이라 평균이 곧 그 색이다. */
function borderColor(buf: Buffer, W: number, H: number): [number, number, number] {
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  const take = (p: number) => {
    r += buf[p * 4];
    g += buf[p * 4 + 1];
    b += buf[p * 4 + 2];
    n++;
  };
  for (let x = 0; x < W; x++) {
    take(x);
    take((H - 1) * W + x);
  }
  for (let y = 0; y < H; y++) {
    take(y * W);
    take(y * W + W - 1);
  }
  return [r / n, g / n, b / n];
}

/**
 * 판 테두리에서 배경색을 flood fill 해 알파 0으로 만든다.
 *
 * **크롭 전에 판 전체에서 돌린다** — 크롭 상자의 변은 머리카락이 물고 있을 수 있어서
 * 씨앗이 모자라고, 그러면 귀와 땋은 빵 사이 같은 자리의 배경이 섬으로 남는다.
 * 발밑 접지 그림자는 이 판정에 안 걸려 남지만, 얼굴 크롭 밖이라 상관없다.
 */
function clearBackground(buf: Buffer, W: number, H: number, tol: number): number {
  const bg = borderColor(buf, W, H);
  const seen = new Uint8Array(W * H);
  const stack: number[] = [];
  for (let x = 0; x < W; x++) {
    stack.push(x, (H - 1) * W + x);
  }
  for (let y = 0; y < H; y++) {
    stack.push(y * W, y * W + W - 1);
  }
  let cleared = 0;
  while (stack.length) {
    const p = stack.pop()!;
    if (seen[p]) continue;
    const i = p * 4;
    if (
      Math.abs(buf[i] - bg[0]) > tol ||
      Math.abs(buf[i + 1] - bg[1]) > tol ||
      Math.abs(buf[i + 2] - bg[2]) > tol
    ) {
      continue;
    }
    seen[p] = 1;
    buf[i + 3] = 0;
    cleared++;
    const x = p % W;
    if (x > 0) stack.push(p - 1);
    if (x < W - 1) stack.push(p + 1);
    if (p >= W) stack.push(p - W);
    if (p < W * (H - 1)) stack.push(p + W);
  }
  return cleared;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  for (const [id, face] of Object.entries(FACES)) {
    const src = path.join(ROOT, face.master);
    if (!existsSync(src)) {
      console.warn(`  ! 마스터 없음, 건너뜀: ${id} (${face.master})`);
      continue;
    }
    const meta = await sharp(src).metadata();
    const W = meta.width!;
    const H = meta.height!;
    if (
      face.left < 0 ||
      face.top < 0 ||
      face.left + face.size > W ||
      face.top + face.size > H
    ) {
      console.error(
        `  ! 크롭 상자가 판(${W}×${H}) 밖이다: ${id} (${face.left},${face.top}) ${face.size}px`,
      );
      process.exitCode = 1;
      continue;
    }

    const buf = await sharp(src).ensureAlpha().raw().toBuffer();
    const alreadyCut = borderIsTransparent(buf, W, H);
    const cleared = alreadyCut ? 0 : clearBackground(buf, W, H, face.bgTol);

    const out = path.join(OUT_DIR, `${id}.webp`);
    await sharp(buf, { raw: { width: W, height: H, channels: 4 } })
      .extract({
        left: face.left,
        top: face.top,
        width: face.size,
        height: face.size,
      })
      .resize(OUT_SIZE, OUT_SIZE)
      .webp({ quality: 88, effort: 6, alphaQuality: 100 })
      .toFile(out);

    console.log(
      `  ✓ ${id}: ${path.basename(face.master)} (${face.left},${face.top}) ${face.size}px` +
        ` → /images/authors/${id}.webp` +
        (alreadyCut
          ? " (마스터가 이미 투명)"
          : ` (배경 ${((cleared / (W * H)) * 100).toFixed(1)}% 제거)`),
    );
  }
}

await main();
