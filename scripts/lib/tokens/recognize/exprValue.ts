/**
 * 갈래 B — 스타일 값 자리의 **문자열·템플릿 리터럴** (KAN-073 S3).
 *
 * `color: ok ? "#fff" : "#000"` · `` borderLeft: `5px solid ${c}` `` 을 옛 추출층이 못 본다.
 * `JSXOBJ` 가 `prop:` **바로 뒤**에 큰따옴표가 와야 매칭되기 때문이다. 실측 34건
 * (삼항 20 · 템플릿 14)이고, 작은 이유가 있다 — 색은 대부분 이미
 * `const INK = "var(--ink, #20264A)"` 꼴로 모여 `fallback.ts` 가 따로 센다.
 * 남은 34건은 **그 상수 체계에서 새어 나간 자리**라 표적이 선명하다.
 *
 * 함정 둘.
 *   · `extract.ts:143` 이 `.tsx` 의 모든 백틱 구간에 이미 `DECL` 을 돌린다 —
 *     `legacyCssSpans` 로 그 범위를 빼지 않으면 **같은 바이트를 두 번 센다.**
 *   · 값 자리를 통째로 위반으로 물면 `` `var(--stroke, 1.5px) solid ${B}` `` 같은
 *     **이미 준수인 자리**까지 잡는다. `classify()` 의 `var()` 제거를 그대로 태워야 한다.
 *
 * 아직 비어 있다 — `S3` 가 채운다(배치2).
 */
import type { RecognizeInput, Recognition, Recognizer } from "./types.ts";

export const exprValue: Recognizer = {
  id: "expr-literal",
  what: "삼항·템플릿 안 문자열 리터럴 — 값 자리 전체를 훑는다",
  scan(_input: RecognizeInput): Recognition[] {
    return [];
  },
  faults: [],
};
