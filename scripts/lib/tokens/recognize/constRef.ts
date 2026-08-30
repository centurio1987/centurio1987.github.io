/**
 * 갈래 F — **상수로 끌어올린 리터럴** (KAN-077 S2).
 *
 * 왜 필요한가 — 이것은 부채 발굴이 아니라 **게이트 회피 경로 차단**이다.
 *   앞의 다섯 인식기는 전부 「값 자리에 적힌 리터럴」을 찾는다. 그런데 값을 다른 줄의
 *   `const` 로 끌어올리면 값 자리에 남는 것은 **식별자뿐**이라 다섯이 전부 그것을 버린다.
 *   그래서 판정 대기 리터럴을 상수로 올리기만 하면 게이트를 피할 수 있었다.
 *
 *   가정이 아니라 실측 전례다. `KANBAN.cards/KAN-072-CPJCT1.md` 의 S10 이 osi EP4~6 에서
 *   `158 → 0` 을 만들었는데 그중 **토큰으로 닫힌 것이 152, 상수로 올려 시야를 벗어난 것이
 *   6** 이었다. 그 6건(`#9a5b2c`)을 원래 인라인 자리로 **되돌려야** 게이트가 다시 물었다.
 *   래칫이 0 일 때 그 0 이 **닫힌 것과 숨은 것을 섞는다** — 이 인식기가 그 섞임을 걷어낸다.
 *
 * ── 기법이 앞의 다섯과 다르다 — 정규식이 아니라 사용처 추적이다
 *   선언만 봐서는 그 상수가 시각 값인지 알 수 없다. `const TOTAL = 12` 와
 *   `const SAND = "#e8c97a"` 를 **문법으로는 못 가른다.** 그래서 **사용처가 축을 정한다** —
 *   값 자리에서 참조되면 그 자리의 속성이 축이고, 참조가 없으면 히트를 안 낸다.
 *
 * ── 범위 한정이 이 인식기의 전부다
 *   값 자리 밖까지 훑으면 SVG 기하 데이터가 쏟아진다. 실측(S1)으로 리터럴 `const` 선언
 *   89개 중 **71개가 값 자리 밖에서만** 참조된다 — `graph/GraphExplorer.tsx` 의
 *   `W = 900`·`H = 640`, `lib/viz/ProcessSteps.tsx` 의 `BADGE_R = 18`
 *   (`height: Math.max(blockH, BADGE_R * 2)` — 평범한 객체 반환값이지 스타일이 아니다),
 *   `AuthorLineup.astro` 의 `SAG = 46`. **이 71 은 히트 0 이 정답이다.**
 *   그래서 범위를 `styleNum`(갈래 A)이 정한 두 자리로만 연다 — `style={{ … }}` 와
 *   `CSSProperties`. **그 함수를 직접 부른다**(`scopesOf`): 「스타일 값 자리가 어디까지인가」를
 *   두 벌로 정의하면 한쪽만 고쳐지고, 그 어긋남은 「부채가 적다」로 읽혀 통과한다.
 *
 * ── `styleNum` 과 다른 점 하나 — 값을 원문에서 읽는다
 *   `scopesOf` 가 주는 `masked` 는 문자열·템플릿·주석이 공백으로 지워진 사본이다.
 *   **속성 자리를 찾는 데는 그것을 쓴다**(`title: "padding: 10px"` 의 안쪽을 속성으로 오인하지
 *   않으려면 그래야 한다). 그런데 실측 15건의 다수가
 *   `` border: `var(--stroke-hair) solid ${SAND}` `` 꼴이라, **값까지 masked 로 읽으면 통째로
 *   못 본다.** 그래서 값 자리는 같은 오프셋의 **원문**에서 읽되, 식별자가 실제로 코드 자리에
 *   있는 것만 세도록 **평범한 문자열과 템플릿의 정적 부분만** 지운다(`${…}` 안쪽은 남긴다).
 *   `masked` 와 길이가 같아 오프셋이 그대로 통한다.
 *
 * ── 히트는 참조가 아니라 **선언 자리**에 낸다
 *   실측 15선언 · 18참조다. 참조마다 내면 같은 값을 여러 번 세고(한 파일에서 `SAND` 가
 *   `border`·`borderLeft` 두 번), 무엇보다 **「고치는 법」이 18줄을 가리키는데 실제로 고칠
 *   곳은 15줄**이다. 한 상수가 두 축에서 쓰이면 축마다 한 건 — 지금 레포에 0건이다.
 *
 * ── 선언표에서 빼는 것 둘
 *   · **`var(` 를 든 값.** `const INK = "var(--ink, #20264A)"` 는 이미 `fallback` 축 관할이다
 *     (실측 521자리). 겹쳐 물면 같은 자리를 두 축이 센다. 같은 여섯 파일의
 *     `INK`·`PANEL`·`HAIR`·`BORDER` 가 전부 그 꼴이고, `HopJourney.tsx` 의 `TEAL_TINT` 는
 *     아예 `color-mix(… var(--cat-skills) 6% …)` 이다.
 *   · **보간이 있는 템플릿.** `` const uid = `dd${g.__decoDoodleSeq}` `` 는 SVG 필터 id 이지
 *     시각 값이 아닌데 `filter: url(#${uid})` 로 값 자리에서 참조된다(실측 2건).
 *     값이 실행 시점에 정해지므로 정적 게이트가 잴 것이 없다.
 *
 * ── 숫자 상수를 왜 여는가 — 지금 0건인데도
 *   값 자리에서 참조되는 숫자 상수는 실측 **0건**이다. 그래도 숫자를 선언표에 담는 이유는,
 *   담지 않으면 **다음에 누가 `const PAD = 18` 을 만들어 `style={{ padding: PAD }}` 로 쓰는
 *   순간 회피 경로가 다시 열리기** 때문이다. 이 카드가 막으려는 것이 그 동작 자체다.
 *   범위 한정이 SVG 기하를 이미 걸러 내므로(위) 숫자를 담아도 헛것이 안 들어온다 —
 *   S1 이 그 71건을 전수로 확인했다.
 *
 * ── 판정은 축 모듈이 지금 코드 그대로 진다
 *   값이 `#e8c97a` 라는 사실은 인라인이든 상수든 같다. 그래서 `color.ts`·`docrule.ts` 에
 *   이 갈래의 분기가 **하나도 없다** — 그것이 「같은 코드로 판정한다」의 뜻이고,
 *   자가검사의 유일성 키에 `src` 가 들어간 근거이기도 하다(`types.ts` 머리주석).
 */
import { axisOfProp, pxify, takesPx } from "../propAxis.ts";
import { PROP, scopesOf, valueEnd } from "./styleNum.ts";
import type { RecognizeInput, Recognition, Recognizer } from "./types.ts";

/**
 * 모듈·블록 스코프를 안 가리는 `const <이름> = <리터럴>`.
 *
 * 스코프를 안 가리는 이유는 이 인식기가 **파일 하나 안에서** 이름을 푼다는 것이고,
 * 같은 이름이 두 스코프에서 다른 리터럴을 드는 자리는 실측 0건이다(그런 자리가 생기면
 * 나중 선언이 이긴다 — 조용히 틀리는 대신 뒤에서 다시 잡히는 방향이다).
 */
const DECLARE =
  /(?<![\w$.])const[ \t]+([A-Za-z_$][\w$]*)[ \t]*(?::[^=\n]+)?=[ \t]*(?:"([^"\n]*)"|'([^'\n]*)'|`([^`\n]*)`|(-?(?:\d+(?:\.\d+)?|\.\d+)))[ \t]*(?=[;\n,)])/g;

/** 값 자리에서 이름을 부르는 것. 뒤에 `(` 가 오면 호출이라 값이 아니다. */
const IDENT = /(?<![\w$.])([A-Za-z_$][\w$]*)(?![\w$(])/g;

/** 선언 하나 — 값과 그 값이 적힌 줄. */
interface Decl { value: string; line: number; numeric: boolean }

/**
 * 평범한 문자열과 템플릿의 **정적 부분**을 공백으로 지운다. `${…}` 안쪽은 남긴다.
 * 길이와 줄바꿈이 원문과 같아서 오프셋이 그대로 통한다.
 *
 * `styleNum` 의 마스킹을 그대로 못 쓰는 자리다 — 그쪽은 템플릿을 통째로 지우는데,
 * 여기서 그러면 실측 15건의 다수(`` `… ${SAND}` ``)를 통째로 못 본다.
 */
function maskKeepInterp(src: string): string {
  const out: string[] = [];
  let i = 0;
  const keep = (n: number) => { out.push(src.slice(i, i + n)); i += n; };
  const blank = (n: number) => { out.push(src.slice(i, i + n).replace(/[^\n]/g, " ")); i += n; };

  const skipQuoted = (q: string) => {
    let j = i + 1;
    while (j < src.length) {
      if (src[j] === "\\") { j += 2; continue; }
      if (src[j] === q) { j++; break; }
      if (src[j] === "\n") break;
      j++;
    }
    blank(j - i);
  };

  while (i < src.length) {
    const c = src[i];
    if (c === '"' || c === "'") { skipQuoted(c); continue; }
    if (c === "`") {
      blank(1);                                  // 여는 백틱
      while (i < src.length) {
        if (src[i] === "\\") { blank(2); continue; }
        if (src[i] === "`") { blank(1); break; } // 닫는 백틱
        if (src[i] === "$" && src[i + 1] === "{") {
          blank(2);
          let depth = 1;
          while (i < src.length && depth > 0) {
            const q = src[i];
            if (q === "\\") { keep(2); continue; }
            if (q === "{") depth++;
            else if (q === "}") { depth--; if (!depth) { blank(1); break; } }
            keep(1);
          }
          continue;
        }
        blank(1);                                // 템플릿의 정적 부분
      }
      continue;
    }
    keep(1);
  }
  return out.join("");
}

/** 이 파일의 선언표. 이름 → 리터럴. */
function declarationsOf(text: string): Map<string, Decl> {
  const out = new Map<string, Decl>();
  // 주석·문자열 안의 가짜 선언을 안 줍도록 훑기는 원문에서 하되, 값의 형태로 거른다.
  for (const m of text.matchAll(DECLARE)) {
    const str = m[2] ?? m[3] ?? m[4];
    const raw = str ?? m[5];
    if (raw === undefined) continue;
    // (1) `var()` 를 든 값은 `fallback` 축 관할이다 — 겹쳐 물면 두 축이 같은 자리를 센다.
    if (str !== undefined && str.includes("var(")) continue;
    // (2) 보간이 있는 템플릿은 값이 실행 시점에 정해진다 — 정적 게이트가 잴 것이 없다.
    if (m[4] !== undefined && m[4].includes("${")) continue;
    out.set(m[1], {
      value: raw,
      line: (text.slice(0, m.index!).match(/\n/g) ?? []).length + 1,
      numeric: m[5] !== undefined,
    });
  }
  return out;
}

export const constRef: Recognizer = {
  id: "const-ref",
  what: "상수로 끌어올린 리터럴 — 값 자리의 식별자를 선언까지 따라간다",

  scan(input: RecognizeInput): Recognition[] {
    // `.css` 에는 JSX 도 `const` 도 없다.
    if (!/\.(tsx|astro)$/.test(input.file)) return [];
    const { text } = input;
    const decls = declarationsOf(text);
    if (!decls.size) return [];

    // 선언 하나가 여러 축에서 쓰일 수 있다 — 축마다 한 건이다.
    const found = new Map<string, { axis: string; prop: string }>();

    for (const { masked, open, end } of scopesOf(text)) {
      // 값은 원문에서 읽는다(위 머리주석). 오프셋이 같도록 같은 구간을 마스킹한다.
      const raw = maskKeepInterp(text.slice(open, end + 1));

      for (const pm of masked.matchAll(PROP)) {
        const prop = pm[1];
        const axis = axisOfProp(prop);
        if (!axis) continue;

        const from = pm.index! + pm[0].length;
        const to = valueEnd(masked, from, masked.length);
        if (from + open > end) continue;

        for (const im of raw.slice(from, to).matchAll(IDENT)) {
          const d = decls.get(im[1]);
          if (!d) continue;
          // 무단위 속성의 숫자는 px 가 아니다(`fontWeight: BOLD`). `styleNum` 과 같은 규약.
          if (d.numeric && !takesPx(prop)) continue;
          const key = `${im[1]}|${axis}`;
          if (!found.has(key)) found.set(key, { axis, prop });
        }
      }
    }

    const out: Recognition[] = [];
    for (const [key, { axis, prop }] of found) {
      const name = key.slice(0, key.lastIndexOf("|"));
      const d = decls.get(name)!;
      out.push({
        axis: axis as Recognition["axis"],
        prop,
        // 숫자는 `styleNum` 과 같은 이유로 px 로 승격한다 — `classify()` 의 맨 숫자
        // 필터와 `dict.byValue`(토큰 값이 `8px` 이다) 두 군데서 죽지 않게.
        value: d.numeric ? pxify(d.value) : d.value,
        rawValue: d.numeric ? d.value : undefined,
        line: d.line,
        src: "const-ref",
      });
    }
    return out;
  },

  /**
   * 고장 둘이 **서로 다른 자리**를 짚는다.
   *
   * ① 만 두면 「선언표는 살아 있고 사용처 추적만 죽은」 고장을 못 잡는다 — 축이 참조에서
   * 오므로 추적이 죽으면 히트가 통째로 0 이 되고, 래칫은 그것을 「줄었다」로 읽어 통과한다.
   *
   * 사유가 옛 갈래(`css-decl`)와 같은 것이 정상이다 — 새 갈래를 CSS 자리와 똑같은 코드로
   * 판정하는 것이 이 확장의 논지이고, 그래서 유일성 키가 `(판정, 사유, 인식 경로)` 셋이다.
   */
  faults: [
    {
      file: "const-ref.tsx",
      verdict: "위반",
      want: "color 축",
      what: "상수로 올린 토큰 밖 색",
      src: "const-ref",
    },
    {
      file: "const-ref-drift.tsx",
      verdict: "드리프트",
      want: "D1 같은 표기",
      what: "상수로 올린 값이 토큰과 같은 표기",
      src: "const-ref",
    },
  ],
};
