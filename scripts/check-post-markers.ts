#!/usr/bin/env bun
/**
 * check-post-markers — 발행된 글에 **미처리 자리표시자 마커**가 남아 있으면 실패한다.
 *
 * 왜: 미치환 마커(예: `[[[…]]]`)가 published 포스트에 남으면 라이브 사이트에 원문 텍스트가 그대로
 * 노출된다(KAN-013에서 webrtc-3에 발생). 이 가드는 그 부류의 결함이 다시는 배포되지 못하게 막는다.
 *
 * 검사 대상: src/content/posts/ 의 모든 .md/.mdx
 * 하드 실패 마커:
 *   - `[[[` … `]]]`      (구 OpenAI 일러스트 단서)
 *   - ```` ```viz ````   (미처리 viz 블록 — apply-viz 누락)
 *   - ```` ```figure ```` (구 make-image 블록)
 *   - `<<meme:`          (미치환 밈)
 * (`(( ))` 는 수식/코드 오탐 위험이 커 하드 검사에서 제외 — 필요 시 수동 확인)
 *
 * 사용: bun scripts/check-post-markers.ts   (문제 있으면 종료코드 1)
 * CI(main.yml)의 build 앞 단계 + ship-post 게이트에서 호출한다.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const POSTS_DIR = path.join(process.cwd(), "src", "content", "posts");

type Hit = { file: string; line: number; marker: string; text: string };

const LINE_MARKERS: { re: RegExp; label: string }[] = [
  { re: /\[\[\[/, label: "[[[…]]] (구 OpenAI 일러스트 단서)" },
  { re: /^```viz\b/, label: "```viz``` (미처리 viz 블록)" },
  { re: /^```figure\b/, label: "```figure``` (구 make-image 블록)" },
  { re: /<<meme:/, label: "<<meme:>> (미치환 밈)" },
];

async function main() {
  let entries: string[];
  try {
    entries = (await readdir(POSTS_DIR)).filter((f) => /\.(md|mdx)$/.test(f));
  } catch {
    console.log("[check-post-markers] posts 디렉터리 없음 — skip");
    return;
  }

  const hits: Hit[] = [];
  for (const name of entries) {
    const full = path.join(POSTS_DIR, name);
    const lines = (await readFile(full, "utf8")).split("\n");
    lines.forEach((text, i) => {
      for (const { re, label } of LINE_MARKERS) {
        if (re.test(text)) hits.push({ file: `src/content/posts/${name}`, line: i + 1, marker: label, text: text.trim().slice(0, 80) });
      }
    });
  }

  if (hits.length === 0) {
    console.log(`[check-post-markers] ✓ ${entries.length}개 글에 미처리 마커 없음`);
    return;
  }

  console.error(`[check-post-markers] ✗ 미처리 마커 ${hits.length}건 — 발행 전 처리(또는 제거)해야 한다:`);
  for (const h of hits) {
    console.error(`  ${h.file}:${h.line}  ${h.marker}`);
    console.error(`      ${h.text}`);
  }
  console.error("  → 구조형은 make-image(```viz```), 밈은 meme-inserter 로 처리. 레거시 마커는 viz 로 대체하거나 제거.");
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
