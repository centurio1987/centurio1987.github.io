/**
 * 갈래 A — 인라인 스타일 객체의 **숫자 리터럴** (KAN-073 S2).
 *
 * `style={{ fontSize: 13, borderRadius: 8, padding: 18 }}` 을 옛 추출층이 통째로 못 본다.
 * `extract.ts:60` 의 `JSXOBJ` 가 값이 큰따옴표 문자열일 때만 뜨기 때문이다.
 * 실측 836건(spacing 407 · font-size 252 · radius 176 · stroke 1) 중 **175건이 스케일 밖**이다.
 *
 * **범위 한정이 이 인식기의 전부다.** `style={{}}`/`React.CSSProperties` 밖에서
 * `prop: 숫자` 를 훑으면 `src/components/deco/Doodle.astro` 의 풍선 글씨 좌표표와
 * `src/components/viz/samples/*` 의 기하 데이터가 들어온다 — CSS 로 오인해 토큰으로 밀면
 * 조용히 깨지는 실측값들이다.
 *
 * 아직 비어 있다 — `S2` 가 채운다(배치2).
 */
import type { RecognizeInput, Recognition, Recognizer } from "./types.ts";

export const styleNum: Recognizer = {
  id: "style-num",
  what: "인라인 style 객체의 숫자 리터럴 — px 로 읽는다",
  scan(_input: RecognizeInput): Recognition[] {
    return [];
  },
  faults: [],
};
