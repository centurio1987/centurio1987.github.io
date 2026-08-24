/**
 * 문서 스케일 판정 + 축 재분류 — 대조 상대는 `s4-docrules.json` (KAN-070 S5).
 *
 * **아직 판정하지 않는다.** 골격만 서 있고 채우는 것은 `S5` 다.
 *
 * 셋 중 유일하게 **판정 규칙 자체를 바꾼다.** 감사의 `spacing` 축 정의
 * (`s3-scan.py:34-38`)에 `width`·`height`·`top`·`left` 가 섞여 있는데,
 * `DESIGN_CONCEPT.md` §9 의 "기준 4px" 는 **여백 규칙**이지 요소 치수나 절대 좌표
 * 규칙이 아니다. 셋으로 가른다:
 *
 *   spacing    padding · margin · gap        → §9 가 다스린다
 *   dimension  width · height · min/max-*    → 다스리지 않는다
 *   position   top · right · bottom · left   → 다스리지 않는다
 *
 * `position` 을 특히 조심한다 — 상위 파일이 전부 데코 실측 좌표다
 * (`pages/design/deco.astro` · `deco/patterns/PhotoFrame.astro` · `styles/viz-frame.css`).
 * `deco-kit` 스킬이 "좌표와 크기는 눈대중이 아니라 실측값이라 근거 없이 바꾸면
 * 조용히 깨진다"고 못박은 자리다.
 *
 * 완료 기준이 둘인 이유가 이것이다:
 *   옛 축 정의로 돌리면 간격 821 + 글자 166 을 재현한다 → 이식이 맞다는 증거
 *   새 축 정의로 돌리면 셋의 수를 낸다 → 둘 다 보고하고 차이를 사유와 함께 낸다
 *
 * 그리고 **감사 문서 정정 목록**을 낸다 — `UI_CONSISTENCY_AUDIT.md` §3-5 의 수치와
 * 부록 A 의 `s3-scan` 해시(`76ec13fd…` → `e5e69a55331207dc`).
 */
import type { AxisModule, AxisResult, ScanContext } from "./types.ts";

export const docrule: AxisModule = {
  id: "docrule",
  what: "간격 · 글자 크기 — DESIGN_CONCEPT.md 스케일 대비 + 축 재분류",
  run(_ctx: ScanContext): AxisResult {
    return { id: "docrule", verdicts: [], failures: [],
             notes: ["문서 축: 미구현 — S5 가 채운다(축 재분류 포함)."] };
  },
};
