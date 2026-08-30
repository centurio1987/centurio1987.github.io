/**
 * 갈래 E — `stroke-width` 계열 (KAN-076 S2).
 *
 * 왜 필요한가.
 *   `propAxis.AXIS` 표에 **속성 자체가 없다.** 그래서 옛 경로 넷(`DECL`·`ATTR`·`JSXOBJ`)도
 *   앞선 인식기 넷도 전부 `axisOfProp("stroke-width") === undefined` 에서 값을 버린다 —
 *   `src/**` 의 50자리가 **위반도 준수도 판정 불가도 아닌, 판정에 아예 안 들어오는** 상태였다.
 *   래칫이 0 일 때 그 0 이 「닫혔다」와 「안 보인다」를 섞고 있었고, 이 인식기가 그중 한 갈래를
 *   걷어낸다. 감사 정본 §6-12 가 열어 둔 항목이다.
 *
 * ── 표에 `stroke-width` 를 보태면 왜 안 되나 (이 모듈의 존재 이유)
 *   보태는 순간 값을 줍는 것이 이 인식기가 아니라 **기존 `DECL`/`ATTR`** 이 된다. 그러면
 *   새 히트에 `css-decl`·`jsx-attr` 이라는 **옛 라벨**이 붙어 감사 원자료 3,539 히트와의
 *   대조가 깨지고, 그 붕괴는 빌드도 타입도 게이트도 초록인 채로 일어난다.
 *   `propAxis.ts` 머리주석의 「여기에 보태지 마라」가 그 뜻이고, KAN-073·KAN-075 가 세운
 *   규약(옛 경로는 그대로 두고 새 `src` 라벨로 덧붙인다) 그대로다.
 *
 * ── 갈림선은 viewBox 유무가 **아니다** (카드·감사 §6-12 정정)
 *   카드는 「viewBox 유무가 갈림선」이라고 적었는데 실측하면 그 선으로는 아무것도 안 갈린다.
 *   스캔 범위 안 50자리가 **전부 viewBox 를 가진 좌표계 안**에 있고, viewBox 없는 SVG 는 0개다.
 *   그리고 **정적 배율이 1 인 자리도 0개**다:
 *
 *     Mascot   168→96 (0.571)   Sparkle  28→22 (0.786)   FeedLink 16→13 (0.8125)
 *     VizNote   96→72 (0.75)    PosterHero 600→1200 (2.0 · 래스터)
 *     Doodle    86→`width` prop — **호출자마다 다르다**(HeroCollage 0.581 · 카탈로그 1.0)
 *     Squiggle · GraphExplorer — `width:100%` 유동
 *
 *   카드가 든 예시 둘도 실측과 안 맞았다. `Doodle.astro:437` 의 `stroke-width="9"` 는
 *   「화면 1~2px」이 아니라 **5.23px**(HeroCollage 가 `width={50}`) 또는 **9px**(카탈로그 기본)
 *   이고, `GraphExplorer.tsx:1308` 은 「안 스케일되는 인라인 SVG」가 아니라
 *   `viewBox={\`0 0 ${W} ${H}\`}`(900×640) + CSS `width:100%; height:auto` 라 **스케일된다.**
 *
 *   그래서 갈림선을 **「이 길이의 단위가 CSS px 인가」**로 다시 썼다. `--stroke-*` 3단은
 *   CSS px 자이고, 배율을 **호출자가 정하는** 자리의 사용자 단위는 그 자로 못 잰다.
 *
 * ── 판정을 안 하는 것이 이 갈래의 결론이다 — 버린 대안 둘
 *   · **정적으로 아는 배율만 환산한다.** `FeedLink` 는 `2.1 × 0.8125 = 1.71px` 로 토큰 밖인데,
 *     SVG 안에서는 `var(--stroke)` 를 써도 `1.5px` 가 px 가 아니라 **사용자 단위 1.5** 로 읽혀
 *     화면에서 1.22px 가 된다. **게이트가 무는데 고칠 길이 없다.**
 *   · **SVG 전용 굵기 스케일을 세운다.** 실측 값 분포가 1·1.3·1.4·1.6·1.8·2·2.1·2.2·2.4·2.6·
 *     3·3.2·3.4·3.5·3.6·4·4.5·7·8·9·10 으로 눈금이 아니라 연속 스펙트럼이고, viewBox 배율이
 *     제각각이라 정규화해도 안 모인다. 눈금을 세울 근거가 없다.
 *
 * ── 좌표계를 못 찾으면 **사용자 단위**로 본다. 거꾸로 두면 조용히 틀린다
 *   못 찾는 자리가 실측 넷이다 — `VizNote.tsx:47`(style 객체가 `<svg>` **위**에 선언),
 *   `PosterHero.tsx:124`(패키지 컴포넌트 `<Canvas viewBox=…>` 가 SVG 를 그린다),
 *   `viz.css` 둘(CSS 파일이라 태그가 없다). 이것을 px 로 넘기면 `PosterHero` 의
 *   `strokeWidth: 2` 가 `--stroke-bold`(2px)와 값이 같아 **드리프트로 잡히는데**, 실제로는
 *   래스터 2배라 화면에서 4px 다. 미상을 px 로 읽는 쪽이 조용히 틀리는 방향이다.
 *
 * ── 값은 맨 숫자를 px 로 승격해 넘긴다 — `classify()` 를 안 고치기 위해서다
 *   `classify()` 의 리터럴 정규식은 단위 없는 `2.6` 을 통으로 못 물고 `\b\d{1,4}\b` 로
 *   **`2` 와 `6` 을 따로** 문다. 게다가 그 뒤에 맨 숫자를 버리는 필터가 있어 `stroke-width="9"`
 *   가 거기서 죽는다. 승격하면 둘 다 안 만나므로 **공용 코드를 한 줄도 안 고친다**
 *   (`styleNum` 이 `pxify` 를 만든 것과 같은 이유이고, 원문 표기는 `rawValue` 에 남긴다).
 *   승격한 `9px` 이 화면의 9px 라는 뜻은 아니다 — 그 사실이 곧 `coord` 가 싣는 값이다.
 *
 * ── 무엇을 안 보는가
 *   · **`.ts` 파일.** 스캔 범위가 `.astro`·`.tsx`·`.css` 라 `doodleMarks.ts` 33건 등
 *     35건이 밖이다. 범위 확장은 감사 §6-1 이 소유한 별건이고, 여기서 열면 `.ts` 28파일이
 *     한꺼번에 들어와 이 갈래의 증분이 안 읽힌다.
 *   · **`stroke` 속성(색).** 그쪽은 `AXIS` 표에 이미 있고 옛 경로가 색 축으로 본다.
 *     여기서 또 보면 같은 바이트를 두 번 센다.
 */
import type { CoordUnit } from "../types.ts";
import type { RecognizeInput, Recognition, Recognizer } from "./types.ts";

/** 네 형태 각각의 값 자리. `stroke-width` 와 `strokeWidth` 를 둘 다 받는다. */
const ATTR_FORM = /(?<![\w-])(stroke-width|strokeWidth)\s*=\s*"([^"\n]{1,120})"/g;
const EXPR_FORM = /(?<![\w-])(strokeWidth)\s*=\s*\{([^}\n]{1,120})\}/g;
const OBJ_FORM  = /(?<![\w-])(strokeWidth)\s*:\s*([^,;}\n]{1,120})/g;
const CSS_FORM  = /(?<![\w-])(stroke-width)\s*:\s*([^;{}]{1,120});/g;

/** `<svg` 여는 태그와 `</svg>` 닫는 태그. 중첩 SVG 를 스택으로 센다. */
const SVG_EDGE = /<svg\b|<\/svg\s*>/g;
/**
 * 여는 태그 안에서 속성 하나. 값은 `"…"` · `'…'` · `{…}` 셋 다 받는다.
 *
 * `{…}` 를 정규식 한 방(`\{[^}]*\}`)으로 자르면 안 된다 — `viewBox={\`0 0 ${W} ${H}\`}` 의
 * 값이 `` `0 0 ${W `` 로 잘려 **사유 문자열에 깨진 조각이 실린다.** 중괄호를 세어 짝을 맞춘다.
 */
function attrOf(attrs: string, name: string): string | null {
  const m = new RegExp(`(?<![\\w-])${name}\\s*=\\s*`, "i").exec(attrs);
  if (!m) return null;
  let i = m.index + m[0].length;
  const open = attrs[i];
  if (open === '"' || open === "'") {
    const end = attrs.indexOf(open, i + 1);
    return end === -1 ? null : attrs.slice(i + 1, end).trim();
  }
  if (open !== "{") return null;
  let depth = 0;
  for (let j = i; j < attrs.length; j++) {
    if (attrs[j] === "{") depth++;
    else if (attrs[j] === "}" && --depth === 0) return attrs.slice(i + 1, j).trim();
  }
  return null;
}

/** `"0 0 86 74"` → `[86, 74]`. 표현식이거나 네 수가 아니면 `null`. */
function viewBoxSize(vb: string | null): [number, number] | null {
  if (!vb) return null;
  const n = vb.trim().split(/[\s,]+/).map(Number);
  return n.length === 4 && n.every((x) => Number.isFinite(x)) ? [n[2], n[3]] : null;
}

/** `"13"` → 13. `{size}` 나 `"100%"` 처럼 정적으로 안 정해지는 값은 `null`. */
function pxAttr(v: string | null): number | null {
  if (!v) return null;
  const m = /^(-?\d*\.?\d+)(px)?$/.exec(v.trim());
  return m ? Number(m[1]) : null;
}

/** 이 파일 안 `<svg>` 구간들 — `[본문 시작, 본문 끝)` 과 여는 태그의 속성 본문. */
interface SvgRegion { from: number; to: number; attrs: string }

function svgRegions(text: string): SvgRegion[] {
  const out: SvgRegion[] = [];
  const stack: { from: number; attrs: string }[] = [];
  for (const m of text.matchAll(SVG_EDGE)) {
    if (m[0].startsWith("</")) {
      const open = stack.pop();
      if (open) out.push({ ...open, to: m.index! });
      continue;
    }
    // 여는 태그의 끝(`>`)을 찾는다. 따옴표와 `{}` 안쪽의 `>` 는 경계가 아니다 —
    // `viewBox={`0 0 ${W} ${H}`}` 와 `onPointerDown={(e) => …}` 가 그 자리다.
    let i = m.index! + m[0].length, depth = 0, quote = "";
    while (i < text.length) {
      const c = text[i];
      if (quote) { if (c === quote) quote = ""; i++; continue; }
      if (c === '"' || c === "'") { quote = c; i++; continue; }
      if (c === "{") depth++;
      else if (c === "}") depth--;
      else if (c === ">" && depth === 0) break;
      i++;
    }
    stack.push({ from: i + 1, attrs: text.slice(m.index! + m[0].length, i) });
  }
  // 안 닫힌 것(자기 닫힘 `/>` 은 SVG 루트에 안 쓴다)은 파일 끝까지로 본다.
  for (const open of stack) out.push({ ...open, to: text.length });
  return out;
}

/**
 * 자리 하나의 좌표계. **가장 안쪽 `<svg>`** 를 쓴다 — 중첩이면 바깥 viewBox 는 무관하다.
 *
 * 규칙은 셋이고 순서가 곧 규칙이다.
 *   1. 감싸는 `<svg>` 가 없다        → 사용자 단위(배율 미상). CSS 파일도 여기다.
 *   2. `viewBox` 가 없다              → CSS px. 사용자 단위와 px 가 1:1 인 유일한 경우다.
 *   3. `viewBox` 치수 == 고정 width/height → CSS px(배율 1).
 *   그 외                             → 사용자 단위.
 */
function coordAt(regions: SvgRegion[], at: number): CoordUnit {
  let owner: SvgRegion | null = null;
  for (const r of regions) {
    if (at < r.from || at >= r.to) continue;
    if (!owner || r.from > owner.from) owner = r;   // 가장 안쪽
  }
  if (!owner) {
    return { unit: "svg-user", why: "감싸는 <svg> 를 못 찾았다 — 배율 미상" };
  }
  const vbRaw = attrOf(owner.attrs, "viewBox");
  const vb = viewBoxSize(vbRaw);
  if (!vbRaw) return { unit: "css-px", why: "viewBox 없는 <svg> — 1 사용자 단위 = 1px" };
  if (!vb) return { unit: "svg-user", why: `viewBox 가 표현식이다 (${vbRaw}) — 배율 미상` };

  const w = pxAttr(attrOf(owner.attrs, "width"));
  const h = pxAttr(attrOf(owner.attrs, "height"));
  if (w === vb[0] && h === vb[1]) {
    return { unit: "css-px", why: `viewBox ${vbRaw} · 렌더 ${w}×${h} — 배율 1` };
  }
  const rendered = w === null ? (attrOf(owner.attrs, "width") ?? "미지정") : String(w);
  return {
    unit: "svg-user",
    why: `viewBox ${vbRaw} · 렌더 폭 ${rendered} — 배율이 1 이 아니거나 호출자가 정한다`,
  };
}

/**
 * 맨 숫자를 px 로 승격한다. `2.6` → `2.6px` · `4px` 는 그대로 · `100%` 도 그대로.
 * 식별자에 붙은 숫자(`l.strength` 의 뒷자리, `w2`)는 앞뒤 경계로 막는다.
 */
const pxifyBare = (v: string) => v.replace(/(?<![\w.#$-])(\d*\.?\d+)(?![\w.%])/g, "$1px");

const inSpan = (spans: RecognizeInput["legacyCssSpans"], at: number) =>
  spans.some(([s, e]) => at >= s && at < e);

export const svgStroke: Recognizer = {
  id: "svg-stroke",
  what: "stroke-width 계열 — 감싸는 <svg> 의 좌표계까지 함께 읽는다",

  scan(input: RecognizeInput): Recognition[] {
    const { file, text, legacyCssSpans, cssChunks, lineAt } = input;
    const out: Recognition[] = [];
    const regions = svgRegions(text);

    const push = (prop: string, raw: string, at: number) => {
      const value = pxifyBare(raw.trim());
      out.push({
        axis: "stroke", prop, value,
        ...(value === raw.trim() ? {} : { rawValue: raw.trim() }),
        coord: coordAt(regions, at),
        line: lineAt(at), src: "svg-stroke",
      });
    };

    // ── CSS 선언. 옛 A 구간이 실제로 읽은 본문에서만 돈다(밖에서 돌면 JSX 가 CSS 로 읽힌다).
    //    줄 번호는 A 구간과 같은 식으로 세고, `coord` 만 원문 오프셋이 필요하다 —
    //    CSS 자리는 감싸는 `<svg>` 가 없어 어차피 규칙 1 로 떨어지므로 청크 오프셋을 그대로 쓴다.
    for (const [chunk, lineOff] of cssChunks) {
      for (const m of chunk.matchAll(CSS_FORM)) {
        const line = lineOff + (chunk.slice(0, m.index!).match(/\n/g) ?? []).length + 1;
        const value = pxifyBare(m[2].trim());
        out.push({
          axis: "stroke", prop: m[1], value,
          ...(value === m[2].trim() ? {} : { rawValue: m[2].trim() }),
          // CSS 선언은 태그 밖이라 감싸는 `<svg>` 가 없다. 그것이 곧 「배율 미상」이다 —
          // 이 선언이 어느 SVG 에 걸리는지는 정적으로 못 따라간다.
          coord: { unit: "svg-user", why: "CSS 선언 — 어느 <svg> 에 걸리는지 정적으로 모른다" },
          line, src: "svg-stroke",
        });
      }
    }

    // ── 나머지 셋은 CSS 구간 **밖**에서만 본다. 겹치면 같은 바이트를 두 번 센다.
    if (!/\.(astro|tsx)$/.test(file)) return out;
    for (const re of [ATTR_FORM, EXPR_FORM, OBJ_FORM]) {
      for (const m of text.matchAll(re)) {
        if (inSpan(legacyCssSpans, m.index!)) continue;
        push(m[1], m[2], m.index!);
      }
    }
    return out;
  },

  /**
   * 고장 **둘**이고, 둘로 나눈 이유가 있다.
   *
   * 이 갈래는 실제 레포에서 거의 전부 `판정 불가` 로 떨어지는데, 자가검사 ②가 찾는 것은
   * 「기대한 판정 + 기대한 사유」라 `판정 불가` 도 검사가 되기는 한다. 다만 **위반 쪽만 두면
   * 좌표계 판별이 거꾸로 돼도(미상을 px 로) 그 검사는 그대로 통과한다** — 그때 실제 레포는
   * 가짜 위반으로 뒤덮인다. 그래서 반대쪽을 한 건 더 둔다.
   *
   *   ① viewBox 없는 `<svg>` 의 토큰 밖 굵기 → `위반` (px 경로가 살아 있는가)
   *   ② viewBox 있는 `<svg>` 의 굵기        → `판정 불가` (사용자 단위 경로가 살아 있는가)
   *
   * 유일성 키가 `(판정, 사유, 인식 경로)` 셋이라 ①의 사유가 옛 `stroke-out.astro` 와 같은
   * `"stroke 축"` 인 것이 정상이다 — 새 갈래를 CSS 자리와 똑같은 코드로 판정한다는 것이
   * 이 확장의 논지이고, 인식 경로가 `svg-stroke` 인 것만으로 다른 검사가 된다.
   */
  faults: [
    { file: "svg-stroke.astro", verdict: "위반", want: "stroke 축",
      what: "viewBox 없는 SVG 의 토큰 밖 선 굵기", src: "svg-stroke" },
    { file: "svg-stroke.astro", verdict: "판정 불가", want: "SVG 사용자 단위",
      what: "viewBox 안 선 굵기를 px 자로 안 잰다", src: "svg-stroke" },
  ],
};
