/**
 * 갈래 C — 인라인 `style="…"` 속성 안의 CSS 선언 (KAN-073 S4).
 *
 * 왜 필요한가.
 *   `ATTR`(`extract.ts:59`)이 `style` 을 매칭하지만 `AXIS.get("style")` 이 `undefined` 라
 *   버려지고(`:161-162`), `.astro` 의 CSS 훑기는 `<style>` 블록만 본다. 그래서 속성 값이
 *   통째로 판정 밖이다 — 실물 확인:
 *   `src/components/deco/CrayonFilters.astro:42` 의
 *   `style="position:absolute;width:0;height:0;overflow:hidden"` 은 **판정 0건**이고,
 *   같은 파일에서 잡히는 8건은 전부 `width="150%"` 꼴의 **별개 속성**(`jsx-attr`)이다.
 *
 * **이 갈래는 부채를 거의 안 낸다.** 실측(`src/**` 전수) 38자리 · 선언 42개이고 내역이
 *   `transform` 32 · `--reveal-i` 3 · `position`/`display` 각 2 · `width`/`height`/`overflow` 각 1
 *   이라, 축이 있는 것은 `width:0`·`height:0` 둘뿐이다.
 *   **값은 부채 발굴이 아니라 구멍 막기다** — 앞으로 여기 쓰이는 값이 판정에 들어온다.
 *   건수가 적다고 규칙을 넓히면 축 없는 속성 32건(`transform`)이 통째로 들어온다.
 *
 * ── 무엇을 안 보는가 (경계가 이 모듈의 절반이다)
 *   · `style={{ … }}` 객체 — `styleNum`(갈래 A)·`exprValue`(갈래 B) 소유다.
 *   · `<style>` 블록과 `.tsx` 템플릿 리터럴 — 이미 `css-decl` 이 먹은 자리라
 *     `legacyCssSpans` 로 뺀다. 안 빼면 **같은 바이트를 두 번 세** 기준선이 조용히 부푼다.
 *   · 축이 없는 속성(`transform`·`position`·`display`·`overflow`)과 CSS 커스텀 속성
 *     (`--reveal-i`) — `axisOfProp()` 이 `undefined` 를 내면 히트를 안 낸다.
 *
 * ── 값은 CSS 그대로 넘긴다. 맨 숫자만 px 로 승격한다.
 *   속성 값이 이미 CSS 문법이라 단위가 붙어 나온다 — 승격이 필요한 자리는 **CSS 에서
 *   단위 없이 쓸 수 있는 유일한 길이인 `0`** 뿐이다. 승격을 안 하면 `classify()` 의 맨 숫자
 *   필터(`extract.ts:116`)가 그 `0` 을 버려 자리가 다시 안 보이게 된다.
 *   `line-height`·`opacity` 처럼 단위가 애초에 안 붙는 속성은 `takesPx()` 가 막는다.
 *   승격하면 게이트가 지목하는 값이 소스에 문자열로 없어지므로 `rawValue` 에 원문을 남긴다.
 */
import { axisOfProp, pxify, takesPx } from "../propAxis.ts";
import type { RecognizeInput, Recognition, Recognizer } from "./types.ts";

/**
 * `style="…"` 속성 하나.
 *
 * 값 클래스(`[^"\n]{1,200}`)를 `ATTR`(`extract.ts:59`)과 **똑같이** 둔다 — 옛 경로가 보고서
 * 축이 없어 버린 자리를 그대로 이어받는 것이 이 모듈이라, 범위가 다르면 「옛 경로가 못 보던
 * 자리」라는 말이 성립하지 않는다. 값에 줄바꿈이 못 들어오므로 **한 속성은 항상 한 줄**이다.
 */
const STYLE_ATTR = /(?<![\w-])style\s*=\s*"([^"\n]{1,200})"/g;

/** 맨 숫자 — CSS 에서 단위 없이 적을 수 있는 것은 `0` 과 무단위 속성뿐이다. */
const BARE_NUM = /^-?\d*\.?\d+$/;

/** 괄호 깊이를 세며 자른다. `url(data:…;base64,…)` 처럼 값 안에 든 구분자를 안 가른다. */
function splitTop(s: string, sep: string): string[] {
  const out: string[] = [];
  let depth = 0, start = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "(") depth++;
    else if (c === ")") depth = Math.max(0, depth - 1);
    else if (c === sep && depth === 0) { out.push(s.slice(start, i)); start = i + 1; }
  }
  out.push(s.slice(start));
  return out;
}

/** `padding:10px` → `{prop, value}`. 괄호 밖 첫 `:` 에서 가른다(`background:url(data:…)`). */
function splitDecl(decl: string): { prop: string; value: string } | null {
  let depth = 0;
  for (let i = 0; i < decl.length; i++) {
    const c = decl[i];
    if (c === "(") depth++;
    else if (c === ")") depth = Math.max(0, depth - 1);
    else if (c === ":" && depth === 0) {
      const prop = decl.slice(0, i).trim();
      const value = decl.slice(i + 1).trim();
      return prop && value ? { prop, value } : null;
    }
  }
  return null;
}

/** 옛 CSS 훑기가 이미 먹은 구간인가. `[시작, 끝)`. */
const inLegacy = (spans: RecognizeInput["legacyCssSpans"], off: number) =>
  spans.some(([s, e]) => off >= s && off < e);

export const attrCss: Recognizer = {
  id: "attr-css",
  what: "인라인 style=\"…\" 속성 안의 CSS 선언",
  scan(input: RecognizeInput): Recognition[] {
    // `.css` 는 전량이 옛 경로 관할이고, 그 밖의 확장자는 애초에 스캔 대상이 아니다.
    if (!input.file.endsWith(".astro") && !input.file.endsWith(".tsx")) return [];

    const out: Recognition[] = [];
    for (const m of input.text.matchAll(STYLE_ATTR)) {
      // `<style>` 블록·템플릿 리터럴 안의 `style="…"` 은 `css-decl` 이 이미 봤다.
      if (inLegacy(input.legacyCssSpans, m.index!)) continue;
      const line = input.lineAt(m.index!);   // 값에 줄바꿈이 없어 속성 전체가 한 줄이다
      for (const decl of splitTop(m[1], ";")) {
        const d = splitDecl(decl);
        if (!d) continue;
        const axis = axisOfProp(d.prop);
        if (!axis) continue;   // transform · position · display · overflow · --커스텀 속성
        const bare = BARE_NUM.test(d.value) && takesPx(d.prop);
        out.push({
          axis, prop: d.prop, line, src: "attr-css",
          value: bare ? pxify(d.value) : d.value,
          ...(bare ? { rawValue: d.value } : {}),
        });
      }
    }
    return out;
  },
  /**
   * 고장 하나. 사유(`want`)가 `spacing-out.astro` 와 같은 `"§9"` 인 것이 정상이다 —
   * 이 갈래는 **CSS 자리와 똑같은 코드로** 판정되므로 사유가 같아야 맞고, 유일성 키가
   * `(verdict, want, src)` 셋이라 인식 경로가 다른 것만으로 다른 검사가 된다
   * (`recognize/types.ts` · `selftest.ts` 머리주석). 사유를 억지로 다르게 쓰면
   * 「같은 코드로 판정한다」가 깨진다.
   */
  faults: [
    { file: "attr-css.astro", verdict: "위반", want: "§9",
      what: "인라인 style 속성 안의 여백이 스케일 밖", src: "attr-css" },
  ],
};
