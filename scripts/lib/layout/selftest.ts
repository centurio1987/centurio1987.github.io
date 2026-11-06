/**
 * 자가검사 — 고장을 일부러 넣어 **축마다 자기 사유로** 무는지 본다.
 *
 * 이 게이트는 측정이 0건이면 통과한다. 그런데 선택자가 빗나가거나 측정 함수가 조용히 빈
 * 배열을 돌려주면 그것도 0건이다 — 죽은 게이트와 깨끗한 사이트가 화면에서 같은 모양이 된다.
 * 그래서 매 실행 첫머리에 실제 지면 하나를 열고 `main` 을 픽스처로 갈아 끼운 뒤, 깨끗한 상태
 * (잡음 0 이어야 한다)와 고장 다섯을 차례로 돌린다. 진짜 글을 쓰지 않는 이유는 글이 고쳐지거나
 * 도식이 사라져도 이 검사가 안 흔들려야 하기 때문이다. 지면 하나를 빌리는 것은 사이트의 실제
 * CSS·서체 배관 위에서 재야 칸 판정이 의미가 있어서다.
 */

/** 열이 맞는 도식. 한글은 두 칸으로 센다(터미널·편집기와 같다). */
const DIAGRAM = [
  "클라이언트          backend",
  "    │                  │",
  "    │ ① 권한 확인      │",
  "    │─────────────────>│",
  "    │                  │",
];

/** `fonts:build` 가 칸 서체에 늘 담는 글자 — 안 담으면 사이트 글이 바뀌는 것만으로
 *  깨끗한 픽스처가 칸을 벗어나 자가검사가 잡음으로 실패한다. */
export const FIXTURE_CHARS = [...new Set(DIAGRAM.join(""))].join("");

const preHtml =(lines: string[], cls = "astro-code github-light code-diagram", style = "overflow-x: auto; white-space: pre;") =>
  `<pre class="${cls}" style="${style}" tabindex="0"><code>` +
  lines.map((l) => `<span class="line"><span>${l}</span></span>`).join("\n") +
  `</code></pre>`;

export const FIXTURE_CLEAN = `<article class="prose"><p>layout 자가검사 픽스처</p>${preHtml(DIAGRAM)}</article>`;

export type Fault = { name: string; html: string; css?: string; viewport?: "mobile"; expect: "overflow" | "grid" | "font" | "unwrapped" | "jog" };

export const FAULTS: Fault[] = [
  {
    name: "칸 서체를 빼고 --font-code 로 되돌린다 (KAN-080 이 만든 모양)",
    html: FIXTURE_CLEAN,
    css: "pre.astro-code code { font-family: var(--font-code) !important; }",
    expect: "grid",
  },
  {
    name: "도식에서 code-diagram 을 떼고 pre-wrap 으로 둔다 (변환기가 빠진 모양)",
    html: `<article class="prose">${preHtml(DIAGRAM, "astro-code github-light", "overflow-x: auto; white-space: pre-wrap;")}</article>`,
    expect: "unwrapped",
  },
  {
    name: "세로선 하나를 한 칸 민다 (원문 오타)",
    html: `<article class="prose">${preHtml(DIAGRAM.map((l, i) => (i === 2 ? l.replace(/ │$/, "  │") : l)))}</article>`,
    expect: "jog",
  },
  {
    name: "min-width 없는 flex 자식에 긴 도식을 넣는다 (QA.astro 가 그랬다)",
    html:
      `<div style="display:flex;gap:8px"><span style="flex:none;width:38px"></span><div>` +
      preHtml(["│" + "─".repeat(160) + "│"]) +
      `</div></div>`,
    viewport: "mobile",
    expect: "overflow",
  },
  {
    name: "선언한 서체 파일이 없다 (새 서체를 굽고 빌드를 안 다시 돌린 모양)",
    html: `<article class="prose"><p style="font-family:'Layout Gate Fault'">가</p></article>`,
    css: "@font-face { font-family: 'Layout Gate Fault'; src: url('/fonts/__layout-gate-missing__.woff2') format('woff2'); }",
    expect: "font",
  },
];
