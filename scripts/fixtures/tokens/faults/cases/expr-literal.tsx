/**
 * 고장 — 값 자리가 따옴표로 시작하지 않아 옛 `JSXOBJ` 가 못 보는 자리 (KAN-073 S3).
 *
 * 한 줄이 셋을 한꺼번에 건다.
 *   · **삼항** 이라 `prop:` 바로 뒤가 `"` 가 아니다 — `extract.ts:63` 의 `JSXOBJ` 는 못 본다.
 *   · 리터럴이 **백틱 안**에 있다. 백틱 구간은 통째로 `legacyCssSpans` 라, 구간을
 *     값 기준으로 빼는 구현이면 이 고장이 조용히 사라진다(빼는 것은 `prop:` 의 자리다).
 *   · `var(--stroke)` 가 같은 값 안에 있다. 값 자리를 통째로 위반으로 물면
 *     **이미 준수인 자리**까지 잡히므로, 반드시 `classify()` 의 `var()` 제거를 지나야 한다.
 */
export function Fault({ on }: { on: boolean }) {
  return <div style={{ borderLeft: on ? `var(--stroke) solid #302d28` : "none" }} />;
}
