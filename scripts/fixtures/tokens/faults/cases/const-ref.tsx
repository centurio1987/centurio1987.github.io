// 고장 — 토큰 밖 색을 `const` 로 끌어올려 값 자리에서 참조한다.
//
// 값 자리에 남는 것이 식별자뿐이라 앞의 다섯 인식기가 전부 이 자리를 버린다.
// 그래서 같은 사유(`color 축`)라도 `color-out.astro` 와 **다른 검사**다 —
// 유일성 키가 `(verdict, want, src)` 셋인 이유가 이것이다(`recognize/types.ts`).
//
// **템플릿 안에서 참조한다.** 실측 15건의 다수가 이 꼴이고(`` `… ${X}` ``),
// `styleNum` 의 마스킹을 그대로 물려받으면 여기가 통째로 안 보인다.
const BRAND = "#ab12cd";

export default function Fault() {
  return <div style={{ border: `1px solid ${BRAND}` }} />;
}
