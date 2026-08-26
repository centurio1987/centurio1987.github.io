/**
 * 판정 쪽 축 판별 — **토큰 이름을 코드에 적지 않는다** (KAN-072).
 *
 * 왜 필요한가.
 *   축 모듈 둘(`color`·`docrule`)이 같은 판별표를 각자 한 벌씩 들고 있었다. 감사 원본
 *   (`s4-classify.py:44-55`)을 그대로 두 번 옮긴 결과인데, 그 표에는 **색 토큰 18개의
 *   이름이 통째로 박혀 있었다.** 그래서 `tokens.css` 에 토큰이 새로 서면 게이트가 그것을
 *   자기 축으로 못 보고 `other` 로 흘렸다. 인식층이 막혀 있으면 뒤따르는 정리가 리터럴을
 *   토큰으로 아무리 바꿔도 색 칸·간격 칸의 수가 안 줄고, **빌드도 타입도 초록이라**
 *   아무도 그 사실을 모른다 — 게이트가 자기 몫을 조용히 안 하는 상태다.
 *
 *   `radius` 하나만 예외였다. `name.includes("radius")` 라는 **규칙**이라서
 *   `--card-radius` 든 `--deco-tape-radius` 든 이름을 몰라도 잡힌다. 이 파일은 radius 가
 *   이미 하던 일을 나머지 축에도 준 것이고, 두 모듈이 같은 판별을 쓰게 한 것이다.
 *
 * 규칙 — 위에서부터 먼저 걸리는 것을 쓴다.
 *
 *   radius   이름에 `radius` 가 들어간다               `--radius-sm` · `--card-radius`
 *   font     이름이 `--font-` · `--text-` 로 시작한다   `--font-body` · `--text-h2`
 *   stroke   이름이 `--stroke` 로 시작한다              `--stroke` · `--stroke-hair`
 *   spacing  이름이 `--space-` 로 시작한다              `--space-8`
 *   layout   페이지 골격 다섯 (아래 `LAYOUT_TOKENS`)
 *   motion   `--ease` · `--dur`
 *   color    이름이 `--cat-` 로 시작하거나 **값이 색이다**
 *   other    나머지
 *
 * ── 왜 색만 값으로 보나
 *   나머지 축은 전부 이름공간을 가질 수 있다(`--radius-*`·`--space-*`·`--text-*`). 색만
 *   `--ink`·`--paper`·`--pop` 처럼 **역할 이름**이라 걸 접두가 없다 — 그래서 이름 18개를
 *   박아 뒀던 것이다. 대신 색은 값만 보면 확실하다: `#hex` · `rgb()` · `hsl()` 셋 중 하나다.
 *   이름을 못 거는 축이라 값으로 보는 것이지, 값이 더 낫다는 말이 아니다.
 *
 * ── 값 규칙이 실제로 옮긴 것 둘 (판정 수는 안 움직인다 — KAN-072 에서 실측)
 *   `--hatch` color → other
 *       값이 `repeating-linear-gradient(...)` 라 색이 아니라 **그림**이다. 대조 상대가 될
 *       수 없다 — 히트 하나는 리터럴 하나이고(`extract.ts` 의 `LITERAL`), 그라디언트 문자열
 *       전체와 같아질 수가 없다. 실측 드리프트 0건이고 옮겨도 0건이다.
 *   `deco.css` 색 토큰 44개 other → color
 *       크레용·펜·크라프트 색이 이제 대조 상대가 된다. 지금은 그 값을 손으로 적은 자리가
 *       하나도 없어 드리프트 0건이지만(실측), 앞으로 `#e0919f` 를 리터럴로 적으면 그
 *       자리에서 잡힌다. `color.ts` 머리주석이 "나중에 `--deco-*-radius` 같은 것이 생기면
 *       걸려야 한다"고 적어 둔 바로 그 자리다.
 *
 * ── `extract.ts` 의 `tokenAxis` 와 **다른 표다**
 *   그쪽은 `--stroke`·`--page-pad` 류를 `spacing` 한 통에 넣는 감사 원본
 *   (`s3-scan.py:56-72`)의 정의이고, 여기는 S4 가 그것을 `stroke`·`layout` 으로 가른
 *   정의다. 그쪽 값은 `Hit.kind`(literal_dup/literal_new)만 정하고 **판정에는 안 쓰인다** —
 *   판정 축은 전부 이 파일이 정한다. 둘을 합치려다 `extract.ts` 를 건드리면 감사
 *   원자료 3,539 히트와의 대조가 깨진다.
 */

/**
 * 판정 쪽 축. `Axis`(추출 쪽, `types.ts`)와 이름이 겹치지만 다른 표다 —
 * `stroke`·`layout` 이 있다. 위 「다른 표다」 절 참고.
 */
export type JudgeAxis =
  | "color" | "radius" | "stroke" | "spacing" | "font" | "layout" | "motion" | "other";

/**
 * 색 값인가 — 헥스는 전체 일치, `rgb(`·`hsl(` 은 접두만 본다. `s4-classify.py:120`.
 *
 * **토큰 값과 히트 값을 같은 자로 잰다.** 축 판별(여기)과 색 축 누수 보정(`color.ts`)이
 * 이 하나를 함께 쓴다 — 두 벌이면 "토큰은 색인데 히트는 색이 아닌" 어긋남이 생긴다.
 */
export const COLORVAL = /^(#[0-9a-fA-F]{3,8}$|rgba?\(|hsla?\()/;

/**
 * 페이지 골격 다섯. **이 축만 이름 목록으로 남는다.**
 *
 * 다섯이 각자 다른 역할 이름이라(`--measure`·`--header-h`) 걸 접두가 없고, 스케일이 아니라
 * 지면 하나에 하나씩인 **고유값**이라 줄줄이 늘어날 성질도 아니다. 늘어난다면 그때 할 일은
 * 이 목록에 이름을 더 적는 것이 아니라 이름공간을 먼저 세우는 것이다.
 */
const LAYOUT_TOKENS: ReadonlySet<string> =
  new Set(["--measure", "--content-max", "--wide-max", "--page-pad", "--header-h"]);

/**
 * 토큰 하나가 사는 축.
 *
 * `value` 가 필요한 이유는 색 때문이다(위 「왜 색만 값으로 보나」). 이름만으로 정할 수 있는
 * 축은 이름으로 먼저 가르고, 남은 것에만 값을 본다 — `--ease: cubic-bezier(...)` 처럼
 * 이름이 확실한 것을 값으로 다시 재지 않기 위해서다.
 *
 * 알아 둘 것: `font` 축은 크기·굵기·행간·자간을 한 통에 넣는다(`extract.ts` 의 축 정의가
 * 그렇다). 그래서 `--text-body: 18px` 은 `line-height: 18px` 과도 값이 같아 드리프트로
 * 잡힌다. 축을 더 가르는 일은 이 자리가 아니라 추출 쪽 축 정의를 손대는 일이다.
 */
export function judgeTokenAxis(name: string, value: string): JudgeAxis {
  if (name.includes("radius")) return "radius";
  if (name.startsWith("--font-") || name.startsWith("--text-")) return "font";
  if (name.startsWith("--stroke")) return "stroke";
  if (name.startsWith("--space-")) return "spacing";
  if (LAYOUT_TOKENS.has(name)) return "layout";
  if (name === "--ease" || name === "--dur") return "motion";
  if (name.startsWith("--cat-") || COLORVAL.test(value.trim())) return "color";
  return "other";
}
