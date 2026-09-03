// 고장 — 인라인 style 객체의 굵기가 §5 의 3단(400·500·700) 밖이다.
//
// 옛 경로는 이 자리를 통째로 못 본다: `styleNum`(갈래 A)이 `takesPx()` 로 걸러 버리고
// (`fontWeight` 의 숫자는 px 가 아니다), 옛 `JSXOBJ` 는 값이 큰따옴표일 때만 뜬다.
// `600` 은 §5 가 700 으로 접기로 한 값이라 실재하지 않는 단이고, 진짜 면이 없으면
// 브라우저가 합성으로 메운다 — 그것이 이 카드가 고치려는 결함이다.
export default function Fault() {
  return <b style={{ fontWeight: 600 }}>진하게</b>;
}
