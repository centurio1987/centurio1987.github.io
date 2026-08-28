// 고장 — 인라인 style 객체의 맨 숫자가 DESIGN_CONCEPT.md §9 여백 스케일 밖이다.
//
// 옛 `JSXOBJ`(`extract.ts`)는 값이 **큰따옴표 문자열**일 때만 떠서 이 자리를 통째로 못 본다.
// 그래서 같은 사유(`§9`)라도 `spacing-out.astro` 와 **다른 검사**다 — 유일성 키가
// `(verdict, want, src)` 셋인 이유가 이것이다(`recognize/types.ts`).
//
// 최소 정본 트리에는 `--space-*` 가 없어 `docrule` 이 문서 상수(4·8·12·16·24·32·48·64·96)로
// 재므로 `10` 이 스케일 밖이다. 실제 `src/` 에서는 `--space-10` 이 있어 같은 값이 드리프트가 된다 —
// 고장 값은 **이 트리의 자로** 골라야 한다.
export default function Fault() {
  return <div style={{ padding: 10 }} />;
}
