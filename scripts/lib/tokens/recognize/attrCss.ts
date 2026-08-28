/**
 * 갈래 C — 인라인 `style="…"` 속성 안의 CSS 선언 (KAN-073 S4).
 *
 * `ATTR`(`extract.ts:59`)이 `style` 을 매칭하지만 `AXIS.get("style")` 이 `undefined` 라
 * 버려지고(`:161-162`), `.astro` 의 CSS 훑기는 `<style>` 블록만 본다. 그래서 속성 값이
 * 통째로 판정 밖이다 — 실물 확인: `src/components/deco/CrayonFilters.astro:42` 는 판정 0건이고
 * 같은 파일에서 잡히는 8건은 전부 `<style>` 블록이다.
 *
 * **이 갈래는 부채를 거의 안 낸다.** 선언 42개(38자리) 중 축이 있는 것은 `width:0`·`height:0`
 * 둘뿐이고 그 둘은 스케일 안이다(`transform` 32 · 커스텀 속성 3 · 축 없는 것 5).
 * **값은 부채 발굴이 아니라 구멍 막기다** — 앞으로 여기 쓰이는 값이 판정에 들어온다.
 *
 * 아직 비어 있다 — `S4` 가 채운다(배치2).
 */
import type { RecognizeInput, Recognition, Recognizer } from "./types.ts";

export const attrCss: Recognizer = {
  id: "attr-css",
  what: "인라인 style=\"…\" 속성 안의 CSS 선언",
  scan(_input: RecognizeInput): Recognition[] {
    return [];
  },
  faults: [],
};
