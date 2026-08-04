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
import { EMOJI_TO_MARK, DOODLE_MARKS } from "../src/lib/doodleMarks";

const POSTS_DIR = path.join(process.cwd(), "src", "content", "posts");

type Hit = { file: string; line: number; marker: string; text: string };
type EmojiHit = { file: string; line: number; emoji: string; suggest: string | null };

const LINE_MARKERS: { re: RegExp; label: string }[] = [
  { re: /\[\[\[/, label: "[[[…]]] (구 OpenAI 일러스트 단서)" },
  { re: /^```viz\b/, label: "```viz``` (미처리 viz 블록)" },
  { re: /^```figure\b/, label: "```figure``` (구 make-image 블록)" },
  { re: /<<meme:/, label: "<<meme:>> (미치환 밈)" },
];

/**
 * 본문 이모지 — **경고만 한다(하드 실패 아님).**
 *
 * 왜 경고인가: 이 가드가 생기기 전에 발행된 글 열일곱 편에 `❌`·`✅` 가 이미
 * 들어 있다. 하드 실패로 만들면 그 글들을 손보기 전까지 **아무 글도 발행되지
 * 않는다** — 남의 글을 인질로 잡는 게이트가 된다. 새 글은 집필 단계(`tech-deepdive`
 * · `review-post` · `post-finalize`)에서 이미 막히고, 이 경고는 그 셋이 다 새면
 * 발행 직전에 눈에 띄라고 두는 마지막 그물이다. 옛 글을 다 옮기고 나면 하드
 * 실패로 올릴 수 있다(KANBAN KAN-062).
 *
 * 코드블록 안은 안 센다 — 터미널 출력이나 ASCII 도식에 든 `★`·`✔` 는 본문 장식이
 * 아니라 **인용한 화면**이라 손대면 인용이 거짓이 된다.
 *
 * **잡는 범위는 매핑표에서 뽑는다.** 유니코드 블록으로 훑으면 안 된다 — 화살표
 * 블록(U+2190~21FF)에는 `→`·`↔` 가, 기타기호 블록에는 `♭` 가 들어 있는데 셋 다
 * 이모지가 아니라 **본문 문장부호**다(한국어 기술 문서에서 `A → B` 는 그냥 쓴다).
 * 한 번 블록으로 훑었다가 261건 중 200건 넘게 이것들이었다. 그래서 잡는 건
 * ① 매핑표에 있는 글자와 ② 그림문자 영역(U+1F300~1FAFF) ③ 홀로 남은 이모지
 * 변이 셀렉터(U+FE0F) 셋뿐이고, ①은 표에서 자동으로 따라오므로 둘이 갈리지 않는다.
 */
const EMOJI_RE = new RegExp(
  `[${Object.keys(EMOJI_TO_MARK)
    /* 표는 앞으로 늘어난다 — `-`·`]`·`^`·`\` 가 들어오는 날 문자 클래스가 조용히
       다른 뜻이 되지 않게 미리 막아 둔다. */
    .map((c) => c.replace(/[\\\]^-]/g, "\\$&"))
    .join("")}\\u{1F300}-\\u{1FAFF}\\u{FE0F}]`,
  "gu",
);

async function main() {
  let entries: string[];
  try {
    entries = (await readdir(POSTS_DIR)).filter((f) => /\.(md|mdx)$/.test(f));
  } catch {
    console.log("[check-post-markers] posts 디렉터리 없음 — skip");
    return;
  }

  const hits: Hit[] = [];
  const emoji: EmojiHit[] = [];
  for (const name of entries) {
    const full = path.join(POSTS_DIR, name);
    const lines = (await readFile(full, "utf8")).split("\n");
    let inFence = false;
    lines.forEach((text, i) => {
      for (const { re, label } of LINE_MARKERS) {
        if (re.test(text)) hits.push({ file: `src/content/posts/${name}`, line: i + 1, marker: label, text: text.trim().slice(0, 80) });
      }
      /* 펜스 토글은 `LINE_MARKERS` 검사 **뒤**에 뒤집는다 — ```` ```viz ```` 자체가
         펜스 여는 줄이라, 먼저 뒤집으면 미처리 viz 블록이 코드로 취급돼 안 잡힌다. */
      if (/^\s*```/.test(text)) inFence = !inFence;
      if (inFence) return;
      for (const m of text.matchAll(EMOJI_RE)) {
        emoji.push({
          file: `src/content/posts/${name}`,
          line: i + 1,
          emoji: m[0],
          suggest: EMOJI_TO_MARK[m[0]] ?? null,
        });
      }
    });
  }

  if (emoji.length > 0) {
    const byFile = new Map<string, EmojiHit[]>();
    for (const e of emoji) byFile.set(e.file, [...(byFile.get(e.file) ?? []), e]);
    console.warn(
      `[check-post-markers] ⚠ 본문 이모지 ${emoji.length}건 (${byFile.size}개 글) — 두들 마크로 갈아 끼울 자리:`,
    );
    for (const [file, list] of byFile) {
      const seen = new Map<string, { lines: number[]; suggest: string | null }>();
      for (const e of list) {
        const cur = seen.get(e.emoji) ?? { lines: [], suggest: e.suggest };
        cur.lines.push(e.line);
        seen.set(e.emoji, cur);
      }
      const parts = [...seen].map(([ch, v]) => {
        const to = v.suggest
          ? `<Mark name="${v.suggest}" /> (${DOODLE_MARKS[v.suggest as keyof typeof DOODLE_MARKS].label})`
          : "대응 없음 → 지운다";
        return `${ch}×${v.lines.length} → ${to}`;
      });
      console.warn(`  ${file}`);
      for (const p of parts) console.warn(`      ${p}`);
    }
    console.warn("  → 표는 src/lib/doodleMarks.ts, 카탈로그는 /design/deco. 코드블록 안은 세지 않는다.");
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
