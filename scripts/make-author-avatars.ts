/**
 * make-author-avatars.ts — 저자 원본 아바타 → 목록/필터칩용 소형 webp 생성.
 *
 * 원본(`AuthorMeta.avatar`)은 프로필 카드용 512~1254px 이미지라 20px 남짓으로 그리는
 * 목록 아이템(KAN-026)·필터 칩(KAN-025)에 그대로 쓰면 글 목록 한 장에 수백 KB가 붙는다.
 * 여기서 64px(≈3x DPR) 사본을 만들어 `AuthorMeta.avatarSm` 로 소비한다.
 *
 * 실행: bun scripts/make-author-avatars.ts
 * 출력: public/images/authors/<id>-sm.webp  (authors.ts 의 avatarSm 과 같은 규약)
 *
 * 멱등하다. 저자를 추가하거나 원본 아바타를 교체했을 때만 다시 돌리면 된다.
 */
import { existsSync, statSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { AUTHORS } from "../src/lib/authors";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "public/images/authors");
const SIZE = 64; // 표시 크기 ~22px 의 약 3배 (hidpi 대비)

/** authors.ts 의 avatarSm 과 같은 규약 — 한쪽만 바꾸면 깨진다. */
export function smallAvatarPath(id: string): string {
  return `/images/authors/${id}-sm.webp`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  for (const author of AUTHORS) {
    if (!author.avatar) continue;
    const src = path.join(ROOT, "public", author.avatar.replace(/^\//, ""));
    if (!existsSync(src)) {
      console.warn(`  ! 원본 없음, 건너뜀: ${author.id} (${author.avatar})`);
      continue;
    }
    const out = path.join(
      ROOT,
      "public",
      smallAvatarPath(author.id).replace(/^\//, ""),
    );
    await sharp(src)
      // AuthorProfile 의 object-fit:cover 와 같은 프레이밍(원본이 정사각이라 잘림 없음)
      .resize(SIZE, SIZE, { fit: "cover" })
      .webp({ quality: 82 })
      .toFile(out);
    const { size } = statSync(out);
    console.log(
      `  ✓ ${author.id}: ${author.avatar} → ${smallAvatarPath(author.id)} (${(size / 1024).toFixed(1)}KB)`,
    );
  }
}

await main();
