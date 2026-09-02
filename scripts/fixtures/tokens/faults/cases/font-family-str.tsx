// 고장 — 스타일 값 자리에 서체 이름을 직접 적었다.
//
// 옛 `JSXOBJ`(`extract.ts`)는 이 자리를 **물기는 한다.** 그런데 `classify()` 의 `LITERAL` 이
// 색·길이·맨 숫자만 보므로 서체 이름에서 리터럴을 하나도 못 뽑아 **히트가 안 만들어진다** —
// 실측으로 `src/**` 의 JSX `fontFamily` 41자리가 전부 히트 0건이었다.
// 그래서 이 갈래를 여는 것은 정규식이 아니라 `literalsOf(src)` 다.
//
// 최소 정본 트리에 `--font-body` 가 있으므로 `font` 축에는 대조할 토큰 체계가 있고,
// 값이 그 밖이며 근거 문서를 안 걸었으므로 `위반` 이다(`docrule.comparable()`).
export default function Fault() {
  return <code style={{ fontFamily: "monospace" }} />;
}
