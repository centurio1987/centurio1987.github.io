/**
 * 갈래 B — 스타일 값 자리의 **문자열·템플릿 리터럴** (KAN-073 S3).
 *
 * `color: ok ? "#fff" : "#000"` · `` borderLeft: `5px solid ${c}` `` 을 옛 추출층이 못 본다.
 * `JSXOBJ` 가 `prop:` **바로 뒤**에 큰따옴표가 와야 매칭되기 때문이다. 실측 34건
 * (삼항 20 · 템플릿 14)이고, 작은 이유가 있다 — 색은 대부분 이미
 * `const INK = "var(--ink, #20264A)"` 꼴로 모여 `fallback.ts` 가 따로 센다.
 * 남은 34건은 **그 상수 체계에서 새어 나간 자리**라 표적이 선명하다.
 *
 * 함정 둘.
 *   · `extract.ts:143` 이 `.tsx` 의 모든 백틱 구간에 이미 `DECL` 을 돌린다 —
 *     `legacyCssSpans` 로 그 범위를 빼지 않으면 **같은 바이트를 두 번 센다.**
 *   · 값 자리를 통째로 위반으로 물면 `` `var(--stroke, 1.5px) solid ${B}` `` 같은
 *     **이미 준수인 자리**까지 잡는다. `classify()` 의 `var()` 제거를 그대로 태워야 한다.
 *
 * ── 왜 정규식 하나가 아니라 훑개(scanner)인가
 * `prop:` 를 전역 정규식으로 찾으면 **문자열 안의 `prop:` 도 걸린다** —
 * `title: "padding: 10px"` 의 안쪽 `padding:` 이 그렇고, 그러면 값이 `10px"` 로 잘려
 * 따옴표 짝이 어긋난 채 `classify()` 에 들어간다. 그래서 왼쪽에서 오른쪽으로 한 번 훑으며
 * **문자열·템플릿·주석을 건너뛰고 코드 자리에서만** `prop:` 를 인정한다. 이 훑기가
 * `.tsx` 의 백틱 구간(= `legacyCssSpans`)을 자연히 통과시키므로, 큰 CSS-in-template 안의
 * `color: #fff;` 은 애초에 후보가 되지 않는다. `legacyCssSpans` 검사를 그 위에 한 겹 더
 * 두는 것은 `.astro` 의 `<style>` 블록 때문이다 — 그쪽은 JS 문자열이 아니라 훑기만으로는
 * 안 걸러지는데, 옛 `DECL` 은 이미 거기를 다 훑었다.
 *
 * ── 갈래 경계 — 무엇을 안 가지는가
 *   · **값이 큰따옴표 문자열로 시작하면 안 낸다.** 그 자리는 `JSXOBJ` 가 이미 먹었고
 *     (`prop: "…"`), 내가 또 내면 `(file, line, value)` 가 옛 히트와 겹친다.
 *   · **문자열·템플릿 리터럴이 하나도 없으면 안 낸다.** `fontSize: ok ? 13 : 15` 의 맨
 *     숫자는 `styleNum`(S2) 소유다 — 값 자리를 통째로 넘기면 `classify()` 가 font 축의
 *     맨 숫자를 보므로, 여기서 안 걸러 주면 두 인식기가 같은 숫자를 각각 낸다.
 *   · **무단위 속성(`fontWeight`·`lineHeight`…)은 안 낸다.** `propAxis.UNITLESS_PROPS` 가
 *     정한 그대로다 — `fontWeight: on ? "700" : "400"` 의 `700` 은 px 스케일과 대조할
 *     값이 아니다.
 *
 * 값 자리는 **같은 줄**로 끊는다(쉼표·세미콜론·닫는 괄호·줄바꿈). 여러 줄로 접힌 삼항은
 * 첫 줄에 리터럴이 없어 그대로 빠지는데, 그 경계가 곧 실측 34건의 경계다.
 */
import type { RecognizeInput, Recognition, Recognizer } from "./types.ts";
import { axisOfProp, UNITLESS_PROPS } from "../propAxis.ts";

const isIdent = (c: string) => (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "-";
const isWordish = (c: string) => /[\w-]/.test(c);

/** 따옴표 문자열의 끝(닫는 따옴표 다음). 안 닫혔으면 줄 끝에서 멈춘다. */
function skipString(text: string, i: number, q: string): number {
  i++;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "\\") { i += 2; continue; }
    if (ch === q) return i + 1;
    if (ch === "\n") return i;
    i++;
  }
  return i;
}

/** 템플릿 리터럴의 끝(닫는 백틱 다음). 줄바꿈을 넘어간다 — 템플릿은 여러 줄이 정상이다. */
function skipTemplate(text: string, i: number): number {
  i++;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "\\") { i += 2; continue; }
    if (ch === "`") return i + 1;
    if (ch === "$" && text[i + 1] === "{") { i = skipInterp(text, i + 2); continue; }
    i++;
  }
  return i;
}

/** `${ … }` 안쪽. 중첩된 문자열·템플릿·중괄호를 다 센다. */
function skipInterp(text: string, i: number): number {
  let depth = 1;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '"' || ch === "'") { i = skipString(text, i, ch); continue; }
    if (ch === "`") { i = skipTemplate(text, i); continue; }
    if (ch === "{") { depth++; i++; continue; }
    if (ch === "}") { depth--; i++; if (!depth) return i; continue; }
    i++;
  }
  return i;
}

interface ValueExpr {
  /** `classify()` 에 그대로 넘길 값 자리 전체. */
  text: string;
  /** 값이 끝난 오프셋. 훑개가 여기서 이어 간다. */
  end: number;
  /** 문자열·템플릿 리터럴이 하나라도 있는가. */
  hasQuoted: boolean;
  /** 큰따옴표 문자열로 시작하는가 — 그러면 `JSXOBJ` 가 이미 먹은 자리다. */
  startsDouble: boolean;
}

/** `prop:` 뒤 값 자리를 같은 줄에서 잘라 낸다. 줄이 바로 끝나면 `null`. */
function readValue(text: string, from: number): ValueExpr | null {
  let i = from;
  while (i < text.length && (text[i] === " " || text[i] === "\t")) i++;
  if (i >= text.length || text[i] === "\n" || text[i] === "\r") return null;

  const start = i;
  const startsDouble = text[i] === '"';
  let depth = 0;
  let hasQuoted = false;

  while (i < text.length) {
    const ch = text[i];
    if (ch === '"' || ch === "'") { i = skipString(text, i, ch); hasQuoted = true; continue; }
    if (ch === "`") { i = skipTemplate(text, i); hasQuoted = true; continue; }
    if (ch === "(" || ch === "[" || ch === "{") { depth++; i++; continue; }
    if (ch === ")" || ch === "]" || ch === "}") { if (!depth) break; depth--; i++; continue; }
    if (!depth && (ch === "," || ch === ";")) break;
    if (ch === "\n") break;
    i++;
  }
  return { text: text.slice(start, i), end: i, hasQuoted, startsDouble };
}

/** 오프셋이 옛 CSS 훑기가 이미 먹은 구간 안인가. */
const inLegacy = (spans: RecognizeInput["legacyCssSpans"], at: number) =>
  spans.some(([s, e]) => at >= s && at < e);

export const exprValue: Recognizer = {
  id: "expr-literal",
  what: "삼항·템플릿 안 문자열 리터럴 — 값 자리 전체를 훑는다",

  scan(input: RecognizeInput): Recognition[] {
    const { file, text, legacyCssSpans, lineAt } = input;
    // `.css` 는 파일 전체가 옛 구간이다. 훑을 이유가 없다.
    if (!file.endsWith(".tsx") && !file.endsWith(".astro")) return [];

    const out: Recognition[] = [];
    let i = 0;
    while (i < text.length) {
      const ch = text[i];

      // 문자열·템플릿·주석 안은 코드가 아니다 — 통째로 건너뛴다(위 머리주석).
      if (ch === '"' || ch === "'") { i = skipString(text, i, ch); continue; }
      if (ch === "`") { i = skipTemplate(text, i); continue; }
      if (ch === "/" && text[i + 1] === "/") {
        const at = text.indexOf("\n", i);
        i = at === -1 ? text.length : at;
        continue;
      }
      if (ch === "/" && text[i + 1] === "*") {
        const at = text.indexOf("*/", i + 2);
        i = at === -1 ? text.length : at + 2;
        continue;
      }
      if (!isIdent(ch)) { i++; continue; }

      // 식별자 한 덩어리. `(?<![\w-])[a-zA-Z-]{3,30}` 과 같은 경계를 손으로 잡는다.
      const idStart = i;
      while (i < text.length && isIdent(text[i])) i++;
      const prop = text.slice(idStart, i);
      if (idStart > 0 && isWordish(text[idStart - 1])) continue;
      if (prop.length < 3 || prop.length > 30) continue;

      let j = i;
      while (j < text.length && /\s/.test(text[j])) j++;
      if (text[j] !== ":") continue;

      const axis = axisOfProp(prop);
      if (!axis) continue;
      if (UNITLESS_PROPS.has(prop.toLowerCase())) continue;
      if (inLegacy(legacyCssSpans, idStart)) continue;

      const val = readValue(text, j + 1);
      if (!val) continue;
      // 옛 `JSXOBJ` 가 먹은 자리 · 리터럴이 없는 자리는 내 것이 아니다(위 「갈래 경계」).
      if (val.startsDouble || !val.hasQuoted) continue;

      out.push({ axis, prop, value: val.text, line: lineAt(idStart), src: "expr-literal" });
      i = val.end;
    }
    return out;
  },

  /**
   * 한 건이면 된다 — 고장 한 줄이 이 갈래의 셋을 한꺼번에 건다(픽스처 머리주석).
   * 사유는 옛 `color-out.astro` 와 같은 `"color 축"` 인데, 그것이 정상이다:
   * 새 갈래를 **CSS 자리와 똑같은 코드로** 판정한다는 것이 이 확장의 논지이고,
   * 자가검사 유일성 키가 `(verdict, want, src)` 셋인 이유도 그것이다.
   */
  faults: [
    { file: "expr-literal.tsx", verdict: "위반", want: "color 축",
      what: "삼항·템플릿 안 토큰 밖 색", src: "expr-literal" },
  ],
};
