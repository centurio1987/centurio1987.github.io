/**
 * 갈래 A — 인라인 스타일 객체의 **숫자 리터럴** (KAN-073 S2).
 *
 * `style={{ fontSize: 13, borderRadius: 8, padding: 18 }}` 을 옛 추출층이 통째로 못 본다.
 * `extract.ts:60` 의 `JSXOBJ` 가 값이 큰따옴표 문자열일 때만 뜨기 때문이다.
 * 실측 836건(spacing 407 · font-size 252 · radius 176 · stroke 1) 중 **175건이 스케일 밖**이다.
 *
 * **범위 한정이 이 인식기의 전부다.** `style={{}}`/`React.CSSProperties` 밖에서
 * `prop: 숫자` 를 훑으면 `src/components/deco/Doodle.astro` 의 풍선 글씨 좌표표와
 * `src/components/viz/samples/*` 의 기하 데이터가 들어온다 — CSS 로 오인해 토큰으로 밀면
 * 조용히 깨지는 실측값들이다. 그래서 범위를 **두 자리로만** 연다:
 *
 *   ① JSX 의 `style={{ … }}` — 여는 두 번째 `{` 부터 짝 `}` 까지.
 *   ② `CSSProperties` 로 타입 지정된 값 자리 — 타입 이름과 여는 `{` 사이에 공백·`=`·`>`·`(`
 *      말고 아무것도 없을 때만 연다. 이 다리가 없으면
 *      `import { useState, type CSSProperties } from "react"` 뒤에 오는 아무 블록이나
 *      스타일 객체로 열린다.
 *
 * **문자열·템플릿·주석 안의 숫자는 안 본다.** 그쪽은 `exprValue`(갈래 B) 소유다 —
 * 갈래를 리터럴의 종류로 갈랐으므로(`types.ts` 머리주석) 여기서 문자열을 물면 같은 바이트를
 * 두 번 세게 된다. 그래서 범위를 잡을 때 **문자열·템플릿·주석을 공백으로 지운 사본**을
 * 만들어 그 위에서만 속성과 숫자를 찾는다. 그 사본은 짝 `}` 를 찾는 데도 같이 쓰인다 —
 * 문자열 안의 `}` 를 세면 범위가 엉뚱한 데서 닫힌다.
 *
 * **단위 없는 속성에서는 히트를 아예 안 낸다.** `propAxis.takesPx()` 가 그 표다.
 * 실측 181건(`fontWeight` 101 · `lineHeight` 71 · `flex`/`flexShrink` 6 · `zIndex` 2 ·
 * `opacity` 1)이 여기 걸리고, 거르지 않으면 `lineHeight: 1.45` 가 `--text-*` 의 px
 * 스케일과 대조돼 위반이 된다.
 *
 * 축은 `propAxis.axisOfProp()` 으로 푼다 — `extract.ts` 의 좁은 `AXIS` 가 아니다.
 * `marginTop`·`marginBottom`·`minWidth` 같은 camelCase 가 그쪽에만 있다.
 *
 * 판정은 안 한다. 숫자를 `pxify()` 로 px 로 올려 `classify()` 에 넘길 뿐이다 —
 * 예외 표와 `var()` 제거가 거기 붙어 있다(`types.ts` 머리주석).
 */
import { axisOfProp, pxify, takesPx } from "../propAxis.ts";
import type { RecognizeInput, Recognition, Recognizer } from "./types.ts";

/** JSX 의 `style={{`. 두 번째 `{` 가 객체를 연다(첫 번째는 JSX 표현식 자리다). */
const STYLE_ATTR = /(?<![\w$.])style\s*=\s*\{\s*\{/g;

/** `React.CSSProperties` 든 `CSSProperties` 든 이름 자리만 본다 — 앞의 `React.` 는 다리가 받는다. */
const CSSPROP = /(?<![\w$])CSSProperties(?![\w$])/g;

/**
 * 타입 이름과 여는 `{` 사이에 있어도 되는 것.
 *
 * `= {` · `=> {` · `=> ({` · `): T {`(함수 몸통) 넷이 실제로 쓰이는 모양이다.
 * 여기서 한 글자라도 벗어나면 값 자리가 아니다 — 특히 `import { … type CSSProperties … }` 와
 * `style={{…} as CSSProperties}` 가 이 검사에서 떨어진다(둘 다 사이에 `}` 가 있다).
 */
const BRIDGE = /^[\s=>(]*$/;

/** 객체 안의 속성 이름 자리. 값은 따로 잘라 본다. */
export const PROP = /(?<![\w$.])([A-Za-z_$][\w$]*)\s*:/g;

/**
 * 값 자리의 숫자 리터럴. 옛 `LITERAL`(`extract.ts:67`)의 `\b\d{1,4}\b` 를 **안 쓴다** —
 * 그쪽은 `11.5` 를 `11`·`5` 로 가르는데, 그 동작이 감사 원자료 3,539 히트 대조의 일부라
 * 건드릴 수 없다. 새 경로는 소수를 온전히 잡아야 반픽셀 글자가 한 건으로 센다.
 */
const NUM = /(?<![\w$.])(-?(?:\d+(?:\.\d+)?|\.\d+))(?![\w$.])/g;

/** 문자열 하나를 건너뛴다. `i` 는 여는 따옴표. 닫는 따옴표 **다음** 위치를 돌려준다. */
function skipString(text: string, i: number): number {
  const q = text[i];
  i++;
  while (i < text.length) {
    const c = text[i];
    if (c === "\\") { i += 2; continue; }
    if (c === q) return i + 1;
    if (c === "\n") return i;   // 안 닫힌 따옴표 — 줄에서 끊는다
    i++;
  }
  return i;
}

/**
 * 템플릿 리터럴 하나를 건너뛴다. `${…}` 안의 중첩 템플릿·문자열·중괄호까지 따라간다.
 * 안 따라가면 `` `${a ? "{" : "}"}` `` 같은 자리에서 짝 `}` 계산이 어긋난다.
 */
function skipTemplate(text: string, i: number): number {
  i++;
  while (i < text.length) {
    const c = text[i];
    if (c === "\\") { i += 2; continue; }
    if (c === "`") return i + 1;
    if (c === "$" && text[i + 1] === "{") {
      i += 2;
      let depth = 1;
      while (i < text.length && depth > 0) {
        const q = text[i];
        if (q === "\\") { i += 2; continue; }
        if (q === "`") { i = skipTemplate(text, i); continue; }
        if (q === '"' || q === "'") { i = skipString(text, i); continue; }
        if (q === "{") { depth++; i++; continue; }
        if (q === "}") { depth--; i++; continue; }
        i++;
      }
      continue;
    }
    i++;
  }
  return i;
}

/**
 * `open` 의 `{` 부터 짝 `}` 까지를 훑어, **문자열·템플릿·주석을 공백으로 지운 사본**과
 * 닫는 `}` 의 위치를 낸다. 길이와 줄바꿈이 원문과 같아서 오프셋이 그대로 통한다.
 *
 * 짝을 못 찾으면 `null` 이다 — 그때는 그 범위를 통째로 버린다. 못 읽은 자리에서 지어낸
 * 히트를 내는 것보다 안 내는 쪽이 낫다(래칫은 늘어야 무는데, 헛것이 늘면 사람이 없는
 * 부채를 갚으러 간다).
 */
function maskObject(text: string, open: number): { masked: string; end: number } | null {
  const parts: string[] = [];
  let i = open;
  let depth = 0;
  const keep = (n: number) => { parts.push(text.slice(i, i + n)); i += n; };
  const blank = (n: number) => {
    parts.push(text.slice(i, i + n).replace(/[^\n]/g, " "));
    i += n;
  };

  while (i < text.length) {
    const c = text[i];
    if (c === "/" && text[i + 1] === "/") {
      const e = text.indexOf("\n", i);
      blank((e === -1 ? text.length : e) - i);
      continue;
    }
    if (c === "/" && text[i + 1] === "*") {
      const e = text.indexOf("*/", i + 2);
      blank((e === -1 ? text.length : e + 2) - i);
      continue;
    }
    if (c === '"' || c === "'") { blank(skipString(text, i) - i); continue; }
    if (c === "`") { blank(skipTemplate(text, i) - i); continue; }
    if (c === "{") { depth++; keep(1); continue; }
    if (c === "}") {
      depth--;
      keep(1);
      if (depth === 0) return { masked: parts.join(""), end: i };
      continue;
    }
    keep(1);
  }
  return null;
}

/** 스타일 객체 하나의 자리 — 여는 `{` 오프셋 · 닫는 `}` 오프셋 · 지운 사본. */
export interface Scope { open: number; end: number; masked: string }

/**
 * 이 파일에서 스타일 객체가 사는 자리 전부. 겹치는 것은 바깥쪽만 남긴다 —
 * 남기지 않으면 같은 숫자를 두 번 센다.
 *
 * **`constRef`(갈래 F)가 이 함수를 그대로 쓴다** — 「스타일 값 자리가 어디까지인가」를
 * 두 벌로 정의하면 한쪽만 고쳐지고, 그 어긋남은 「부채가 적다」로 읽혀 통과한다.
 * 그쪽은 `masked` 로 속성 자리만 찾고 값은 원문에서 읽는다(템플릿 안의 `${SAND}` 를
 * 봐야 하기 때문이다 — 여기서는 그것이 지워져 있어도 되지만 거기서는 아니다).
 */
export function scopesOf(text: string): Scope[] {
  const opens: number[] = [];
  for (const m of text.matchAll(STYLE_ATTR)) opens.push(m.index! + m[0].length - 1);
  for (const m of text.matchAll(CSSPROP)) {
    const after = m.index! + m[0].length;
    const brace = text.indexOf("{", after);
    if (brace === -1) continue;
    if (!BRIDGE.test(text.slice(after, brace))) continue;
    opens.push(brace);
  }
  opens.sort((a, b) => a - b);

  const out: Scope[] = [];
  let covered = -1;
  for (const open of opens) {
    if (open <= covered) continue;              // 바깥 범위가 이미 먹은 자리
    const got = maskObject(text, open);
    if (!got) continue;
    out.push({ open, end: got.end, masked: got.masked });
    covered = got.end;
  }
  return out;
}

/**
 * 값 표현식의 끝. `,`·`;`·줄바꿈, 또는 이 객체를 닫는 `}` 에서 끊되 괄호·대괄호·중괄호
 * 안쪽은 지나친다 — `padding: fn(a, b)` 의 첫 쉼표에서 끊으면 뒤 인자가 값이 아닌 자리에서
 * 다시 읽힌다.
 */
export function valueEnd(masked: string, from: number, limit: number): number {
  let depth = 0;
  for (let i = from; i < limit; i++) {
    const c = masked[i];
    if (c === "(" || c === "[" || c === "{") { depth++; continue; }
    if (c === ")" || c === "]" || c === "}") {
      if (depth === 0) return i;
      depth--;
      continue;
    }
    if (depth === 0 && (c === "," || c === ";" || c === "\n")) return i;
  }
  return limit;
}

/**
 * 값 표현식 안에서 **정말 CSS 값이 되는 자리**만 남기고 나머지를 공백으로 지운다.
 * 길이는 그대로라 오프셋이 통한다. 지우는 것이 둘이다.
 *
 *   ① 괄호·대괄호·중괄호 **안쪽** — 함수 인자와 배열 첨자다. 화면에 나가는 값이 아니다.
 *      실측으로 이걸 안 지우면 `background: active ? tint(DANGER, 12.2) : tint(ACCENT, 12.2)`
 *      의 색 보정 비율 `12.2` 가 색 축 히트가 되고, `tint(INK, 20)` 의 `20` 도 따라 들어온다.
 *   ② 삼항의 **조건부** — 최상위 `?` 앞. `background: i === 0 ? IDLE : PANEL` 의 `0` 은
 *      배열 첨자 비교지 배경색이 아니고, `step === SEGMENTS.length - 1 ? …` 의 `1` 도 같다.
 *      **가지(branch)는 값이다** — `fontSize: ok ? 13 : 15` 의 둘은 그대로 히트다.
 *
 * 실측: 이 둘을 안 지우면 색 축에 33건이 헛것으로 들어온다(전부 조건식·함수 인자).
 *
 * **판정만 떼어낸 `valueSlotMask` 를 `typeUnitless`·`fontFamilyStr`(KAN-080 S5)가 쓴다.**
 * 그쪽은 지운 사본이 아니라 **원문**에서 값을 읽어야 해서(문자열 내용이 필요하다) 자리
 * 판정과 값 읽기를 갈라야 하는데, 판정을 두 벌로 적으면 한쪽만 고쳐진다 — `scopesOf` 를
 * `constRef` 와 공유하는 것과 같은 이유다.
 */
export function valueSlotMask(expr: string): boolean[] {
  let depth = 0;
  let condEnd = -1;
  for (let i = 0; i < expr.length; i++) {
    const c = expr[i];
    if (c === "(" || c === "[" || c === "{") { depth++; continue; }
    if (c === ")" || c === "]" || c === "}") { depth--; continue; }
    // `a?.b`(옵셔널 체이닝)·`a ?? b`(널 병합)는 삼항이 아니다.
    if (depth === 0 && c === "?" && expr[i + 1] !== "." && expr[i + 1] !== "?" && expr[i - 1] !== "?") {
      condEnd = i;
      break;
    }
  }

  const out: boolean[] = [];
  depth = 0;
  for (let i = 0; i < expr.length; i++) {
    const c = expr[i];
    const open = c === "(" || c === "[" || c === "{";
    const close = c === ")" || c === "]" || c === "}";
    if (open) depth++;
    const keep = depth === 0 && !open && !close && i > condEnd;
    if (close) depth--;
    out.push(keep);
  }
  return out;
}

/** 위 판정을 그대로 적용해 지운 사본. 길이·줄바꿈이 원문과 같아 오프셋이 통한다. */
function valueSlots(expr: string): string {
  const keep = valueSlotMask(expr);
  return [...expr].map((c, i) => (keep[i] ? c : c === "\n" ? "\n" : " ")).join("");
}

export const styleNum: Recognizer = {
  id: "style-num",
  what: "인라인 style 객체의 숫자 리터럴 — px 로 읽는다",

  scan(input: RecognizeInput): Recognition[] {
    // `.css` 에는 JSX 도 타입 주석도 없다. `.astro`·`.tsx` 만 본다.
    if (!/\.(tsx|astro)$/.test(input.file)) return [];
    const { text } = input;
    const out: Recognition[] = [];

    // 옛 CSS 훑기가 먹은 구간(`.tsx` 의 템플릿 리터럴)은 건드리지 않는다. 여기서는 템플릿을
    // 이미 지우므로 겹칠 일이 없지만, 겹침은 조용한 고장이라 계약이 준 값으로 한 번 더 막는다.
    const inLegacy = (o: number) => input.legacyCssSpans.some(([s, e]) => o >= s && o < e);

    for (const { masked, open, end } of scopesOf(text)) {
      for (const pm of masked.matchAll(PROP)) {
        const prop = pm[1];
        const axis = axisOfProp(prop);
        if (!axis) continue;
        if (!takesPx(prop)) continue;   // fontWeight·lineHeight·zIndex… — 숫자가 px 가 아니다

        const vFrom = pm.index! + pm[0].length;
        const expr = valueSlots(masked.slice(vFrom, valueEnd(masked, vFrom, masked.length)));

        for (const nm of expr.matchAll(NUM)) {
          const off = open + vFrom + nm.index!;   // masked[0] 이 원문 `open` 자리다
          if (off > end || inLegacy(off)) continue;
          out.push({
            axis,
            prop,
            value: pxify(nm[1]),
            rawValue: nm[1],
            line: input.lineAt(off),
            src: "style-num",
          });
        }
      }
    }
    return out;
  },

  /**
   * 사유가 `spacing-out.astro`(옛 `css-decl` 경로)와 **같은 `§9`** 인 것이 정상이다 —
   * 새 갈래를 CSS 자리와 똑같은 코드로 판정하는 것이 이 확장의 논지라, 사유를 억지로 다르게
   * 쓰면 그 논지가 깨진다. 그래서 유일성 키가 `(verdict, want, src)` 셋이다.
   */
  faults: [
    {
      file: "style-num.tsx",
      verdict: "위반",
      want: "§9",
      what: "인라인 style 객체의 맨 숫자가 여백 스케일 밖",
      src: "style-num",
    },
  ],
};
