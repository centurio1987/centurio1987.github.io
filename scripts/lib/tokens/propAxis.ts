/**
 * 속성 → 축 표 하나 — 옛 경로와 새 인식층이 **같은 표를 다르게 읽는다** (KAN-073 S1).
 *
 * 왜 필요한가.
 *   축 정의가 `extract.ts` 와 `docrule.ts` 두 곳에 각각 하드코딩돼 있었고, 둘 다
 *   **camelCase 를 일부만** 들고 있었다. `backgroundcolor`·`fontsize` 는 있는데
 *   `margintop`·`minwidth`·`rowgap`·`flexbasis` 는 없다. 그래서
 *
 *     · `extract.ts` 는 `marginLeft: "16px"` 을 축이 없다고 버렸고(실측 6자리),
 *     · `docrule.ts` 는 없는 키를 `?? "spacing"` 으로 떨어뜨려 **여백 취급**했다.
 *       그대로 인식층을 넓히면 `minWidth: 200` 이 §9(4·8·12·16…)로 재어져 **가짜 위반**이 된다.
 *
 *   손으로 나열하면 다음에 또 빠진다. 그래서 **kebab 원형에서 camelCase 를 기계로 만든다.**
 *
 * 무엇을 안 바꾸나 — 이 파일의 존재 이유이자 제약이다.
 *   `AXIS` 는 `extract.ts` 에 있던 표를 **한 글자도 안 바꿔 옮긴 것**이다(원본
 *   `scripts/fixtures/tokens/reference/s3-scan.py:29-46`). 옛 경로는 계속 이것만 쓴다 —
 *   여기에 camelCase 를 보태면 그 값을 줍는 것이 새 인식기가 아니라 **기존 `JSXOBJ`** 라서
 *   새 히트에 `"style-obj"` 라는 옛 라벨이 붙고, 감사 원자료 3,539 히트와의 대조가 깨진다.
 *   실측 증분은 정확히 1건이다 —
 *   `src/components/posts/vpn-anatomy-2/NonceReuseLab.tsx:306` 의 `minWidth: "10rem"`.
 *   그 확장은 이 카드의 `S5` 가 화이트리스트와 함께 따로 한다.
 *
 *   **새 인식기만 `axisOfProp()` 을 쓴다.** 그쪽은 새 `src` 라벨을 달고 나오므로
 *   옛 집합과 섞이지 않는다.
 */
import type { Axis } from "./types.ts";

// ── 축 정의: CSS 속성 → 축. 원본 s3-scan.py:29-46 그대로. **여기에 보태지 마라**(위 주석).
export const AXIS = new Map<string, Axis>();
const reg = (axis: Axis, ...props: string[]) => props.forEach((p) => AXIS.set(p, axis));
reg("color", "color","background","background-color","background-image","border-color",
  "border","border-top","border-right","border-bottom","border-left",
  "border-top-color","border-right-color","border-bottom-color","border-left-color",
  "outline","outline-color","fill","stroke","stop-color","stopcolor",
  "text-decoration-color","caret-color","accent-color","backgroundcolor","bordercolor");
reg("spacing","margin","margin-top","margin-right","margin-bottom","margin-left",
  "padding","padding-top","padding-right","padding-bottom","padding-left",
  "gap","row-gap","column-gap","top","right","bottom","left","inset",
  "width","height","min-width","min-height","max-width","max-height","flex-basis");
reg("radius","border-radius","border-top-left-radius","border-top-right-radius",
  "border-bottom-left-radius","border-bottom-right-radius","borderradius");
reg("shadow","box-shadow","text-shadow","filter","boxshadow","textshadow");
reg("font","font","font-family","font-size","font-weight","line-height","letter-spacing",
  "fontfamily","fontsize","fontweight","lineheight","letterspacing");
reg("zindex","z-index","zindex");

/**
 * `spacing` 축 안의 세 갈래. §9 관할은 `spacing` 하나뿐이다.
 * `docrule.ts` 에 있던 표를 그대로 옮겼다(원본 축 정의 26개를 빠짐없이 셋으로 나눈 것).
 */
export type SpacingGroup = "spacing" | "dimension" | "position";
const SPACING_GROUP = new Map<string, SpacingGroup>();
const grp = (g: SpacingGroup, ...props: string[]) => props.forEach((p) => SPACING_GROUP.set(p, g));
grp("spacing", "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
  "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
  "gap", "row-gap", "column-gap");
grp("dimension", "width", "height", "min-width", "min-height", "max-width", "max-height", "flex-basis");
grp("position", "top", "right", "bottom", "left", "inset");

/** `min-width` → `minwidth`. JSX 속성은 소문자화하면 하이픈만 사라진다. */
const camelKey = (kebab: string) => kebab.replace(/-/g, "");

/** kebab 키마다 camelCase 소문자형을 보탠 사본을 만든다. 원본 맵은 안 건드린다. */
function widen<T>(base: ReadonlyMap<string, T>): Map<string, T> {
  const out = new Map(base);
  for (const [k, v] of base) {
    if (!k.includes("-")) continue;
    const c = camelKey(k);
    if (!out.has(c)) out.set(c, v);
  }
  return out;
}

const AXIS_WIDE = widen(AXIS);
const SPACING_GROUP_WIDE = widen(SPACING_GROUP);

/**
 * 새 인식층 전용 축 판별 — kebab 과 camelCase 를 **둘 다** 받는다.
 * 옛 경로는 이걸 안 쓴다(위 머리주석).
 */
export function axisOfProp(prop: string): Axis | undefined {
  return AXIS_WIDE.get(prop.trim().toLowerCase());
}

/**
 * `spacing` 축의 갈래. 표에 없는 속성은 여백으로 본다 —
 * 조용히 관할 밖으로 새는 쪽이 더 나쁘다(`docrule.ts` 가 이미 정한 규약).
 */
export function spacingGroupOf(prop: string): SpacingGroup {
  return SPACING_GROUP_WIDE.get(prop.trim().toLowerCase()) ?? "spacing";
}

/**
 * **숫자가 px 가 아닌 속성.** React 는 `style={{ fontWeight: 700 }}` 에 단위를 안 붙인다.
 *
 * 거르지 않으면 `lineHeight: 1.45` 가 `--text-*` 의 px 스케일과 대조돼 위반이 된다 —
 * `AXIS` 표에서 `lineheight`·`fontweight` 가 **font 축**이기 때문이다.
 * 실측 181건(`fontWeight` 101 · `lineHeight` 71 · `flex`/`flexShrink` 6 · `zIndex` 2 ·
 * `opacity` 1)이 여기 걸린다. 새 인식층은 이 속성들에서 **히트를 아예 안 낸다.**
 *
 * 목록은 React 의 무단위 속성 규약을 따른다. `AXIS` 밖 속성도 함께 적어 둔 것은
 * 축 표가 넓어져도 이 판단이 안 흔들리게 하려는 것이다.
 */
export const UNITLESS_PROPS: ReadonlySet<string> = new Set([
  "fontweight", "font-weight", "lineheight", "line-height",
  "zindex", "z-index", "opacity", "order", "zoom",
  "flex", "flexgrow", "flex-grow", "flexshrink", "flex-shrink",
  "columncount", "column-count", "fillopacity", "fill-opacity",
  "strokeopacity", "stroke-opacity", "aspectratio", "aspect-ratio",
]);

/** 새 인식층이 이 속성의 숫자값을 px 로 읽어도 되는가. */
export const takesPx = (prop: string) => !UNITLESS_PROPS.has(prop.trim().toLowerCase());

/**
 * 숫자 리터럴을 px 로 승격한다 — `13` → `13px`.
 *
 * 승격하는 이유는 판정을 **CSS 자리와 똑같은 코드로** 하기 위해서다. `"13"` 으로 넘기면
 * `classify()` 의 맨 숫자 필터와 `dict.byValue`(토큰 값이 `8px` 이다) 두 군데서 죽는다.
 * 승격하면 `docrule` 의 §9·§5 와 `color` 의 radius 검사가 축 모듈 수정 없이 그대로 문다.
 *
 * 대신 게이트가 지목하는 「값」이 소스에 문자열로 없어지므로, 부르는 쪽이 원문 표기를
 * `Hit.rawValue` 에 남긴다(`verify-tokens.ts` 의 "고치는 법" 이 grep 으로 못 찾는 값을
 * 가리키지 않게 하려는 것이다).
 */
export const pxify = (n: string) => `${n}px`;
