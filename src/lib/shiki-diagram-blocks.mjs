/**
 * 상자 선·화살표·도형 문자가 든 코드블록은 **도식**이다 — 줄을 접으면 그림이 부서진다.
 *
 * `astro.config.mjs` 의 `shikiConfig.wrap: true` 는 모든 `<pre>` 에
 * `white-space: pre-wrap` 을 박는다. 코드 한 줄이 접히는 것은 읽을 만하지만, 도식은
 * 세로선이 칸 단위로 맞물려야 그림이 된다. 접히는 순간 이어진 선이 다음 줄로 떨어지고
 * 그 아래 줄들이 전부 한 칸씩 밀린다. 그래서 도식만 줄바꿈을 끄고 블록 안에서 가로로
 * 스크롤하게 둔다(`pre` 의 `overflow-x: auto` 는 그대로다).
 *
 * `code-diagram` 클래스는 `scripts/verify-layout.ts` 와의 계약이다 — 게이트가 같은
 * 판별식(`DIAGRAM_CHARS`)으로 도식을 골라 이 클래스와 `white-space: pre` 가 붙었는지 본다.
 * 이 변환기가 빠지면 그 자리에서 문다.
 */

/** 화살표(U+2190–21FF) · 상자 선과 블록(U+2500–259F) · 도형(U+25A0–25FF). */
export const DIAGRAM_CHARS = /[←-⇿─-▟■-◿]/;

export const shikiDiagramBlocks = {
  name: "diagram-blocks",
  pre(node) {
    if (!DIAGRAM_CHARS.test(this.source)) return;
    // Astro 의 wrap 변환기가 먼저 돌고 이것이 뒤에 돈다(사용자 변환기는 뒤에 붙는다).
    const kept = String(node.properties.style ?? "")
      .split(";")
      .map((d) => d.trim())
      .filter((d) => d && !/^(white-space|word-wrap|overflow-wrap)\s*:/.test(d));
    node.properties.style = [...kept, "white-space: pre"].join("; ") + ";";
    this.addClassToHast(node, "code-diagram");
  },
};
