/**
 * 갈래 D — CSS 구간 안에서 **줄바꿈을 넘는 선언** (KAN-075 S1).
 *
 * 왜 필요한가.
 *   옛 선언 정규식 `DECL`(`extract.ts`)의 값 클래스가 `[^;{}\n]` 이라 **줄바꿈을 넘는
 *   선언이 통째로 판정 밖**이다. 실물 확인: `src/components/Logo.astro:58` 의
 *
 *       box-shadow:
 *         0 0 0 1px rgba(32, 38, 74, 0.12),
 *         0 1px 3px rgba(28, 27, 24, 0.18);
 *
 *   여기 든 색 둘은 게이트가 **한 번도 본 적이 없다.** `box-shadow`·`transition`·
 *   `background`(그라디언트)·`clip-path` 처럼 값이 길어 줄을 나눠 쓰는 속성이 전부 이 자리다.
 *   실측 `src/**` 전수 54선언 · 20파일 → 히트 173건(색 141 · 그림자 32).
 *
 * ── 옛 정규식을 왜 안 고치나 (이 모듈의 존재 이유)
 *   `DECL` 의 값 클래스에서 `\n` 만 빼면 한 줄로 끝나 보이지만, 그러면 **옛 히트 집합이
 *   움직여** 감사 원자료(`scripts/fixtures/tokens/reference/s4-classify.json`, 3,539 히트)와
 *   히트 단위로 대조할 수 없게 된다. 그 대조가 「이식이 맞는가」를 판정하는 유일한 수단이다.
 *   KAN-073 이 세운 규약 그대로 — **옛 경로는 그대로 두고 새 `src` 라벨로 덧붙인다.**
 *   실측으로 확인했다: 이 인식기를 붙여도 옛 히트 4,073 이 아홉 필드 키로 바이트 단위 동일.
 *
 * ── 겹쳐 세지 않기 위한 가드 **둘**. 지금 레포에서 무는 자리가 0 건이지만 실측이지 보장이 아니다.
 *   1. **값에 줄바꿈이 없으면 안 낸다.** 콜론 뒤 `\s*` 가 줄바꿈을 흡수하므로
 *      `grid-template-columns:\n  repeat(2, 1fr);` 처럼 값이 다음 줄에서 시작해도
 *      그 값이 한 줄이면 **옛 경로가 이미 잡는다.**
 *   2. **`DECL` 매치가 새 매치 구간 안에 들어앉으면 그 바이트를 값에서 지운다.** 값 안에
 *      `prop:…;` 꼴이 들어가는 자리가 있다 — `background: url(data:image/svg+xml;base64,…)`
 *      의 `data:image/svg+xml;` 을 `DECL` 이 문다. 축이 없어 지금은 히트가 안 나지만
 *      축 표가 넓어지면 같은 바이트를 두 번 세게 된다.
 *
 *      **구간을 통째로 버리지 않고 그 바이트만 지우는 이유**가 있다. 버리면 옛 경로가
 *      실제로 세지 않은 나머지 리터럴까지 함께 사라져, 겹쳐 세는 것(가짜 위반)을 피하려다
 *      **안 보이는 것(가짜 0)** 을 만든다. 래칫에서는 뒤쪽이 더 나쁘다 — 늘면 실패하지만
 *      안 보이면 통과하기 때문이다.
 *
 * ── 셋째 가드가 있었는데 **죽여도 아무것도 안 바뀌어서 지웠다** (KAN-075 S2).
 *   「같은 시작 오프셋에서 `DECL` 이 이미 매치했으면 건너뛴다」였다. 논리로도 실측으로도
 *   가드 1 에 완전히 포함된다 — `DECL` 이 자리 S 에서 물었다면 콜론과 `;` 사이에 줄바꿈이
 *   없다는 뜻이고, 그러면 `DECL_ML` 의 값에도 줄바꿈이 없어 가드 1 이 먼저 문다.
 *   `check-recognize-invariant.ts --self-test` 로 **하나씩 죽여 봤더니 둘 다 초록**이었고
 *   (둘을 함께 죽여야 빨개진다) 그래서 지웠다. 죽여도 아무 검사가 안 우는 가드는
 *   **있는 것이 아니라 있어 보이는 것**이고, 다음 사람이 그것을 근거로 안심한다.
 *
 * ── 무엇을 안 보는가 (경계가 이 모듈의 절반이다)
 *   · **CSS 구간 밖**은 통째로 안 본다. `cssChunks` 가 곧 관할이고 그것은
 *     `extract.ts` 의 A 구간이 넘겨준 것 그대로다 — `.css` 전체 · `.astro` 의 `<style>` ·
 *     `.tsx` 의 템플릿 리터럴. 밖에서 돌면 JSX 코드가 CSS 로 읽힌다.
 *   · 축이 없는 속성 — `transition`·`animation`·`clip-path`·`grid-template-*` 는
 *     `axisOfProp()` 이 `undefined` 를 내므로 히트를 안 낸다. 실측 54선언 중 그것이
 *     절반가량이고, `src/styles/motion.css` 의 여러 줄 선언 3건이 전부 여기 걸려
 *     **생성물에서 새 히트가 0건**인 이유이기도 하다.
 *   · 한 줄 선언 — 옛 `DECL` 관할이다(가드 2).
 *
 * ── 값은 공백을 접어서 넘긴다.
 *   `classify()` 의 리터럴 정규식 중 `rgba\([^)]*\)` 는 `[^)]` 가 줄바꿈을 포함해서,
 *   접지 않으면 **줄바꿈이 든 값**이 `Hit.value` 로 들어간다. 그러면 게이트가 지목하는
 *   값이 소스에서 grep 이 안 된다 — `rawValue` 를 만든 것과 같은 이유의 문제다.
 *   접어도 리터럴 자체는 안 바뀌므로(리터럴 안에 줄바꿈이 있는 자리가 실측 0건) 그대로 둔다.
 */
import { axisOfProp } from "../propAxis.ts";
import type { RecognizeInput, Recognition, Recognizer } from "./types.ts";

/**
 * 옛 `DECL`(`extract.ts`)과 **한 글자만 다르다** — 값 클래스에서 `\n` 을 뺐고 길이 상한을
 * 200 → 600 으로 올렸다. 여러 줄 선언은 한 줄 선언보다 길어서 200 에서 잘리면
 * (그라디언트 정지점이 늘어선 자리가 그렇다) 뒤쪽 리터럴이 통째로 안 잡힌다.
 * 중괄호는 여전히 경계다 — 안 그러면 규칙 하나가 통째로 값으로 빨려 들어간다.
 */
const DECL_ML = /(?<![\w-])([a-zA-Z-]{3,30})\s*:\s*([^;{}]{1,600});/g;

/** 옛 경로의 그것. **똑같아야 한다** — 다르면 「이미 먹은 자리」 판정이 어긋난다. */
const DECL = /(?<![\w-])([a-zA-Z-]{3,30})\s*:\s*([^;{}\n]{1,200});/g;

const nl = (s: string) => (s.match(/\n/g) ?? []).length;

export const multilineDecl: Recognizer = {
  id: "multiline-decl",
  what: "CSS 구간 안에서 줄바꿈을 넘는 선언",
  scan(input: RecognizeInput): Recognition[] {
    const out: Recognition[] = [];
    for (const [chunk, lineOff] of input.cssChunks) {
      // 옛 경로가 이 구간에서 무엇을 물었는지 먼저 센다. 가드 1·3 이 이것을 쓴다.
      // 옛 경로가 이 구간에서 문 자리들. 가드 2 가 이것을 쓴다.
      const legacy: [number, number][] = [];
      for (const m of chunk.matchAll(DECL)) legacy.push([m.index!, m.index! + m[0].length]);

      for (const m of chunk.matchAll(DECL_ML)) {
        const start = m.index!, end = start + m[0].length;
        if (!m[2].includes("\n")) continue;                         // 가드 1

        const axis = axisOfProp(m[1]);
        if (!axis) continue;   // transition · animation · clip-path · grid-template-*

        // 가드 2 — 옛 경로가 이 안에서 이미 문 바이트를 값에서 지운다(통째로 안 버린다).
        //   값의 시작 위치는 `m[0]` 안에서 `m[2]` 가 놓인 자리다. 문자열 검색으로 찾지
        //   않는다 — 같은 조각이 앞에 또 있으면 엉뚱한 자리를 가리킨다.
        const valueStart = end - 1 - m[2].length;                   // 끝의 `;` 를 뺀 자리
        let value = m[2];
        for (const [ls, le] of legacy) {
          if (ls <= start || ls >= end) continue;
          const a = Math.max(0, ls - valueStart), b = Math.min(value.length, le - valueStart);
          if (a < b) value = value.slice(0, a) + " ".repeat(b - a) + value.slice(b);
        }

        out.push({
          axis, prop: m[1], src: "ml-decl",
          value: value.replace(/\s+/g, " ").trim(),
          line: lineOff + nl(chunk.slice(0, start)) + 1,
        });
      }
    }
    return out;
  },
  /**
   * 고장 하나. 사유(`want`)가 `color-out.astro` 와 같은 `"color 축"` 인 것이 정상이다 —
   * 이 갈래는 **CSS 자리와 똑같은 코드로** 판정되므로 사유가 같아야 맞고, 유일성 키가
   * `(verdict, want, src)` 셋이라 인식 경로가 `ml-decl` 인 것만으로 다른 검사가 된다
   * (`recognize/types.ts` · `selftest.ts` 머리주석).
   */
  faults: [
    // 고장은 **색 축 속성**으로 심는다. 이 갈래의 대표 사례는 여러 줄 `box-shadow` 인데
    // (`src/components/Logo.astro:58`), 그림자 축에는 문서에 판정 가능한 규칙이 없어
    // 「판정 불가」로 떨어진다 — 인식은 되는데 고장이 안 걸린다(실측으로 밟았다).
    { file: "ml-decl.astro", verdict: "위반", want: "color 축",
      what: "여러 줄 그라디언트 안의 토큰 밖 색", src: "ml-decl" },
  ],
};
