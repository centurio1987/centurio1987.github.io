/**
 * 갈래 G — **무단위 글자 축**: 굵기와 행간 (KAN-080 S5).
 *
 * 왜 필요한가.
 *   `propAxis.UNITLESS_PROPS` 는 `fontWeight`·`lineHeight` 에서 **히트를 아예 안 낸다.**
 *   그 표는 원래 `lineHeight: 1.45` 가 `--text-*` 의 px 스케일과 대조돼 가짜 위반이 되는
 *   것을 막으려고 세운 것인데(KAN-073), 막는 방식이 「안 보기」라서 굵기·행간 자리가
 *   통째로 판정 밖이 됐다. 실측으로 **굵기 204자리 · 행간 131자리가 토큰율 0%** 인데
 *   게이트는 그것을 한 건도 안 센다(`UI_CONSISTENCY_AUDIT.md` §7-1).
 *
 *   `S6` 이 이 축에 자를 대려면 먼저 **보여야** 한다. 못 보는 것은 못 잰다.
 *
 * ── 무엇을 여는가 — 셋이고, 각각 못 보던 이유가 다르다
 *   ① **JSX style 객체의 숫자**  `style={{ fontWeight: 700, lineHeight: 1.6 }}`
 *      `styleNum`(갈래 A)이 `takesPx()` 로 걸러 버린다. 실측 굵기 101 · 행간 71.
 *   ② **값 표현식**  `fontWeight: on ? "700" : "400"`
 *      `exprValue`(갈래 B)가 `UNITLESS_PROPS` 로 걸러 버린다. 실측 7.
 *   ③ **CSS 선언의 소수 행간**  `line-height: 1.75`
 *      옛 `LITERAL`(`extract.ts`)의 `\b\d{1,4}\b` 가 이것을 **`1` 과 `75` 로 가른다.**
 *      그 동작은 감사 원자료 3,539 히트 대조의 일부라 **고칠 수 없으므로**, 같은 자리를
 *      새 경로가 온전한 값으로 다시 낸다. 실측 39자리.
 *
 * ── 무엇을 안 여는가 (경계가 이 모듈의 절반이다)
 *   · **`letterSpacing` 은 관할 밖이다.** `styleNum` 이 pxify 로 잡는 것은 맞지만, 실측하면
 *     JSX `letterSpacing` 은 1건뿐이고(`PosterHero.tsx:132` 의 SVG 속성, 문자열이라 관할 밖)
 *     자간 47자리는 전부 CSS 선언이다. CSS 자간은 `0.5px`·`0.04em` 처럼 **단위가 붙어**
 *     옛 `LITERAL` 이 이미 온전히 문다. **지금 겹칠 자리가 0 이고, 장래 겹침을 미리 가른다.**
 *   · **CSS 의 정수 행간(`line-height: 1`)과 굵기(`font-weight: 700`)는 안 낸다.** 옛 경로가
 *     그 자리에서 **같은 값을 이미 온전히** 물었으므로 다시 내면 `(file, line, value)` 가
 *     겹치고, 겹쳐 세면 새 기준선이 조용히 부푼다(`check-recognize-invariant` 가드 ②).
 *     `exprValue` 가 「값이 큰따옴표로 시작하면 안 낸다」로 옛 `JSXOBJ` 를 피하는 것과 같은 규약이다.
 *   · **인라인 `style="line-height:1.6"` 속성은 `attrCss`(갈래 C) 소유다.** 그쪽은
 *     `UNITLESS_PROPS` 로 안 거르므로 이미 히트를 낸다(실측 그 형태 0자리) — 여기서 또 내면
 *     같은 바이트를 두 번 센다. 그 자리의 소수 파편은 `attrCss` 가 고칠 몫이지 이 모듈이 아니다.
 *
 * ── 값은 px 로 안 올린다
 *   `styleNum`·`attrCss` 는 맨 숫자를 `pxify()` 로 승격하는데, 이 축은 그러면 안 된다 —
 *   `fontWeight: 700` 의 `700` 은 길이가 아니다. 그래서 값을 **원문 그대로** 넘기고,
 *   소수를 온전히 무는 일은 `classify()` 가 `src` 로 갈라 한다(`extract.ts` 의 `literalsOf`).
 */
import { axisOfProp } from "../propAxis.ts";
import { PROP, scopesOf, valueEnd, valueSlotMask } from "./styleNum.ts";
import type { RecognizeInput, Recognition, Recognizer } from "./types.ts";

/** 이 인식기의 관할. `letterSpacing` 은 일부러 없다(위 「무엇을 안 여는가」). */
const UNITLESS_FONT: ReadonlySet<string> = new Set([
  "fontweight", "font-weight", "lineheight", "line-height",
]);

/** 옛 경로의 `DECL`. **똑같아야 한다** — 다르면 「옛 경로가 문 자리」 판정이 어긋난다. */
const DECL = /(?<![\w-])([a-zA-Z-]{3,30})\s*:\s*([^;{}\n]{1,200});/g;

/**
 * 옛 `LITERAL` 이 **가르는** 값인가. 단위 없는 소수 하나뿐이다.
 *
 * `1.75` → `1`·`75`. 정수(`1`)와 단위값(`0.5px`)은 옛 경로가 이미 온전히 문다.
 * `1.6 !important` 처럼 뒤에 뭔가 붙은 자리는 여기서 안 걸린다 — 실측 0자리이고,
 * 넓히면 옛 경로가 문 자리와 겹칠 위험이 생긴다.
 */
const FRAGMENTED = /^-?\d*\.\d+$/;

const nl = (s: string) => (s.match(/\n/g) ?? []).length;

export const typeUnitless: Recognizer = {
  id: "type-unitless",
  what: "굵기 · 행간 — 무단위라 판정 밖이던 자리",

  scan(input: RecognizeInput): Recognition[] {
    const { file, text, cssChunks, legacyCssSpans, lineAt } = input;
    const out: Recognition[] = [];

    // ── ③ CSS 선언 중 **옛 경로가 가른 값만**. 구간은 옛 경로가 읽은 것 그대로다
    //    (주석이 이미 걷혀 있다 — 다시 걷으면 다른 바이트를 보게 된다).
    for (const [chunk, lineOff] of cssChunks) {
      for (const m of chunk.matchAll(DECL)) {
        const prop = m[1].toLowerCase();
        if (!UNITLESS_FONT.has(prop)) continue;
        const v = m[2].trim();
        if (!FRAGMENTED.test(v)) continue;          // 옛 경로가 이미 온전히 물었다
        const axis = axisOfProp(m[1]);
        if (axis !== "font") continue;
        out.push({
          axis, prop: m[1], value: v, src: "type-unitless",
          line: lineOff + nl(chunk.slice(0, m.index!)) + 1,
        });
      }
    }

    // ── ①·② JSX 스타일 값 자리. `.css` 에는 이런 자리가 없다.
    if (!/\.(tsx|astro)$/.test(file)) return out;
    const inLegacy = (o: number) => legacyCssSpans.some(([s, e]) => o >= s && o < e);

    for (const { masked, open, end } of scopesOf(text)) {
      for (const pm of masked.matchAll(PROP)) {
        const prop = pm[1];
        if (!UNITLESS_FONT.has(prop.toLowerCase())) continue;
        const axis = axisOfProp(prop);
        if (axis !== "font") continue;

        const vFrom = pm.index! + pm[0].length;
        const vTo = valueEnd(masked, vFrom, masked.length);
        const off = open + vFrom;
        if (off > end || inLegacy(off)) continue;

        // **자리 판정은 지운 사본으로, 값 읽기는 원문으로.** 삼항 조건과 함수 인자를
        // 떨어뜨리는 판정(`fontWeight: i === 0 ? 700 : 400` 의 `0`)은 `styleNum` 것을 그대로
        // 쓰고, 값은 원문에서 읽는다 — 지운 사본에는 `"700"` 의 내용이 없다.
        const keep = valueSlotMask(masked.slice(vFrom, vTo));
        const raw = text.slice(off, open + vTo);
        const value = [...raw].map((c, i) => (keep[i] ? c : c === "\n" ? "\n" : " ")).join("").trim();
        if (!value) continue;

        out.push({ axis, prop, value, line: lineAt(off), src: "type-unitless" });
      }
    }
    return out;
  },

  /**
   * 고장 하나 — CSS 소수 행간이 **온전히** 인식되는가.
   *
   * `want` 를 값(`1.42`)으로 잡은 것이 요점이다. 옛 경로의 파편은 사유에 `(1)`·`(42)` 로
   * 들어오므로 이 검사를 통과하지 못한다 — **파편과 온전한 값을 사유로 가른다.**
   * `판정 불가` 인 것은 `S5` 시점에 행간 규칙이 아직 없기 때문이다. `S6` 이 자를 대면
   * 이 고장은 **`위반`(행간 단 밖)으로 올라가고**, 그때 이 줄을 함께 고친다.
   */
  faults: [
    { file: "type-unitless.astro", verdict: "판정 불가", want: "(1.42)",
      what: "CSS 소수 행간이 파편이 아니라 온전한 값으로 인식", src: "type-unitless" },
  ],
};
