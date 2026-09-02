/**
 * 갈래 H — **스타일 값 자리의 raw 서체 이름** (KAN-080 S5).
 *
 * 왜 필요한가 — 실측으로 찾은 구멍이다.
 *   `font-family` 히트는 **131건 전부 `css-decl` 이고 전부 준수**다. 그런데 JSX 의
 *   `fontFamily: "monospace"` **41자리는 히트가 0건**이다. 「리터럴 0건」이라는 부록 B 의
 *   판정이 반쪽이었던 자리이고(`UI_CONSISTENCY_AUDIT.md` §7-3), 결함이 실재한다 —
 *   같은 글 안에서 마크다운 코드블록(JetBrains Mono)과 시뮬 코드(OS 기본 고정폭)가
 *   **다른 서체로 뜬다.**
 *
 *   0건인 이유는 축이 없어서가 아니다. 옛 `JSXOBJ` 는 `fontFamily: "monospace"` 를 물지만,
 *   `classify()` 의 `LITERAL` 이 **색·길이·맨 숫자만** 보므로 서체 이름에서 리터럴을 하나도
 *   못 뽑아 히트가 안 만들어진다. 그래서 여는 것이 정규식이 아니라 **`classify()` 의
 *   리터럴 패턴**이고(`extract.ts` 의 `literalsOf`), 그것을 `src` 로 갈라 이 갈래에만 준다.
 *
 * 이것이 없으면 `S10`~`S12` 의 완료 기준을 게이트로 증명할 수 없다.
 *
 * ── 무엇을 안 보는가
 *   · **`var(` 가 든 값.** 옛 `JSXOBJ` 가 그 자리를 `var()` 토큰 히트로 이미 물었다 —
 *     다시 내면 `(file, line, value)` 가 겹친다(`check-recognize-invariant` 가드 ②).
 *     `const MONO = "var(--font-code)"` 를 거치는 10자리도 `fallback` 축이 따로 센다.
 *   · **CSS 선언.** `src/**` 전수에서 `var()` 를 안 쓴 `font-family` 선언이 **0자리**다.
 *   · **JSX 속성(`fontFamily="…"`)과 인라인 `style="font-family:…"`.** 실측 8자리가 전부
 *     `{표현식}` 이라 문자열 리터럴이 없고, 인라인 속성 쪽은 0자리다. 여기를 열면 각각
 *     `jsx-attr`·`attr-css` 와 관할이 겹친다.
 *   · **CSS 전역 키워드**(`inherit`·`initial`·`unset`·`revert`). 서체 선택이 아니라
 *     상속 지시라 대조할 토큰이 애초에 없다 — 위반으로 부르면 고칠 수 없는 부채가 된다.
 */
import { axisOfProp } from "../propAxis.ts";
import { PROP, scopesOf, valueEnd, valueSlotMask } from "./styleNum.ts";
import type { RecognizeInput, Recognition, Recognizer } from "./types.ts";

/** `docrule.comparable()` 의 `FAMILY_PROPS` 와 같은 집합이다 — 그쪽이 판정하는 속성만 연다. */
const FAMILY_PROPS: ReadonlySet<string> = new Set(["fontfamily", "font-family", "font"]);

/** 서체 선택이 아닌 값. 위 머리주석 마지막 항. */
const CSS_WIDE: ReadonlySet<string> = new Set(["inherit", "initial", "unset", "revert", "revert-layer"]);

/** 값 표현식 안의 문자열 리터럴 내용들. `${}` 가 든 템플릿은 값을 못 정하므로 버린다. */
function literalsIn(raw: string, keep: boolean[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < raw.length; i++) {
    const q = raw[i];
    if (q !== '"' && q !== "'" && q !== "`") continue;
    if (!keep[i]) continue;                       // 삼항 조건·함수 인자 안이다
    let j = i + 1;
    let interp = false;
    while (j < raw.length) {
      const c = raw[j];
      if (c === "\\") { j += 2; continue; }
      if (c === q) break;
      if (q !== "`" && c === "\n") break;         // 안 닫힌 따옴표 — 줄에서 끊는다
      if (q === "`" && c === "$" && raw[j + 1] === "{") interp = true;
      j++;
    }
    if (raw[j] === q && !interp) out.push(raw.slice(i + 1, j));
    i = j;
  }
  return out;
}

export const fontFamilyStr: Recognizer = {
  id: "font-family-str",
  what: "스타일 값 자리에 문자열로 적힌 서체 이름",

  scan(input: RecognizeInput): Recognition[] {
    const { file, text, legacyCssSpans, lineAt } = input;
    if (!/\.(tsx|astro)$/.test(file)) return [];
    const out: Recognition[] = [];
    const inLegacy = (o: number) => legacyCssSpans.some(([s, e]) => o >= s && o < e);

    for (const { masked, open, end } of scopesOf(text)) {
      for (const pm of masked.matchAll(PROP)) {
        const prop = pm[1];
        if (!FAMILY_PROPS.has(prop.toLowerCase())) continue;
        if (axisOfProp(prop) !== "font") continue;

        const vFrom = pm.index! + pm[0].length;
        const vTo = valueEnd(masked, vFrom, masked.length);
        const off = open + vFrom;
        if (off > end || inLegacy(off)) continue;

        // 자리 판정은 지운 사본으로, 내용은 원문으로 — 지운 사본에는 문자열 내용이 없다.
        const keep = valueSlotMask(masked.slice(vFrom, vTo));
        const raw = text.slice(off, open + vTo);
        for (const lit of literalsIn(raw, keep)) {
          const v = lit.trim();
          if (!v || v.includes("var(")) continue;
          if (CSS_WIDE.has(v.toLowerCase())) continue;
          out.push({ axis: "font", prop, value: v, line: lineAt(off), src: "font-family-str" });
        }
      }
    }
    return out;
  },

  /**
   * 고장 하나. 사유가 옛 `css-decl` 과 같은 `"font 축"` 인 것이 정상이다 — 이 갈래도
   * **CSS 자리와 똑같은 코드로** 판정되고(`docrule.comparable()`), 유일성 키가
   * `(verdict, want, src)` 셋이라 인식 경로가 다른 것만으로 다른 검사가 된다.
   */
  faults: [
    { file: "font-family-str.tsx", verdict: "위반", want: "font 축",
      what: "스타일 값에 서체 이름을 직접 적었다", src: "font-family-str" },
  ],
};
