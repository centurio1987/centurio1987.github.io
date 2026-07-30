/**
 * viz 텍스트 측정·줄바꿈 — 로컬 viz kind 가 공유하는 단일 소스.
 *
 * **왜 패키지 것을 안 쓰나.** `@centurio1987/bbangto-ui-visualization` 의
 * `estimateWidth` 는 문자 종류와 무관하게 고정 비율(`0.55 * fontSize`)을 쓴다.
 * 라틴엔 맞지만 한글은 전각(1em)이라 **약 45% 과소평가**한다. 그래서 패키지의
 * `wrapText` 로 감싸도 한글 줄은 상자를 넘고, "안 잘린다"는 판정 자체가 틀린다.
 *
 * SVG `<text>` 는 리플로도 클리핑도 하지 않는다 — 넘친 글자는 조용히 상자 밖으로
 * 흘러 viewBox 경계에서 잘린 채 렌더된다. 그러니 **그리기 전에 재는 것**이 유일한
 * 방어선이고, 그 자를 여기 하나로 모은다.
 */

/**
 * 글리프 하나의 대략 폭(단위: fontSize 배수).
 *
 * CJK/한글은 전각(1em), 라틴·숫자·구두점은 좁게 잡는다.
 */
export function glyphRatio(ch: string): number {
  const c = ch.codePointAt(0) ?? 0;
  const isWide =
    (c >= 0x1100 && c <= 0x11ff) || // 한글 자모
    (c >= 0x2e80 && c <= 0x303f) || // CJK 부수 · 기호
    (c >= 0x3130 && c <= 0x318f) || // 호환 자모
    (c >= 0x4e00 && c <= 0x9fff) || // 한자
    (c >= 0xac00 && c <= 0xd7af) || // 한글 음절
    (c >= 0xf900 && c <= 0xfaff) ||
    (c >= 0xff00 && c <= 0xff60); // 전각 형태
  if (isWide) return 1;
  if (ch === "—" || ch === "―") return 1; // em dash
  if (ch === " ") return 0.3;
  if (ch >= "A" && ch <= "Z") return 0.68;
  if (ch >= "a" && ch <= "z") return 0.56;
  if (ch >= "0" && ch <= "9") return 0.58;
  return 0.42; // 그 외 구두점 (· , . : / + = 등)
}

/** 문자열의 대략 렌더 폭(viewBox 단위). 약간 보수적으로(넉넉히) 잡는다. */
export function textWidth(text: string, fontSize: number): number {
  let ratio = 0;
  for (const ch of text) ratio += glyphRatio(ch);
  return ratio * fontSize * 1.02;
}

/** 어절 단위 줄바꿈. 한 어절이 한 줄보다 길면 글자 단위로 쪼갠다. */
export function wrap(text: string, maxWidth: number, fontSize: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const test = current ? `${current} ${word}` : word;
    if (current && textWidth(test, fontSize) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
    // 한 어절 자체가 폭을 넘으면 글자 단위로 강제 분리
    while (textWidth(current, fontSize) > maxWidth && current.length > 1) {
      let cut = current.length - 1;
      while (cut > 1 && textWidth(current.slice(0, cut), fontSize) > maxWidth) cut--;
      lines.push(current.slice(0, cut));
      current = current.slice(cut);
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

/**
 * 같은 줄 수를 유지하는 가장 좁은 폭으로 다시 감싼다(균형 줄바꿈).
 *
 * 그리디 줄바꿈은 첫 줄을 꽉 채워 "무엇을 고르든 어디서 / 넘어지는가" 처럼
 * 의미가 끊긴 자리에서 꺾인다. 줄 수를 늘리지 않는 선에서 폭을 줄이면
 * "무엇을 고르든 / 어디서 넘어지는가" 로 자연스러운 어절 경계에 붙는다.
 */
export function balance(
  text: string,
  maxWidth: number,
  fontSize: number,
  lineCount: number,
): string[] {
  let best = wrap(text, maxWidth, fontSize);
  if (lineCount <= 1) return best;
  let lo = 1;
  let hi = maxWidth;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const lines = wrap(text, mid, fontSize);
    if (lines.length <= lineCount) {
      best = lines;
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  return best;
}

/** 후보 크기 사다리에서 maxLines 안에 들어가는 가장 큰 크기를 고른다. */
export function fit(
  text: string,
  maxWidth: number,
  maxLines: number,
  sizes: readonly number[],
): { size: number; lines: string[] } {
  for (const size of sizes) {
    const lines = wrap(text, maxWidth, size);
    if (lines.length <= maxLines) {
      return { size, lines: balance(text, maxWidth, size, lines.length) };
    }
  }
  const size = sizes[sizes.length - 1];
  const lines = wrap(text, maxWidth, size);
  return { size, lines: balance(text, maxWidth, size, lines.length) };
}

/** `viewBox` 문자열 → [x, y, w, h]. 파싱 실패 시 fallback. */
export function parseViewBox(
  viewBox: string | undefined,
  fallback: [number, number, number, number],
): [number, number, number, number] {
  if (!viewBox) return fallback;
  const parts = viewBox.trim().split(/[\s,]+/).map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) return fallback;
  return parts as [number, number, number, number];
}
