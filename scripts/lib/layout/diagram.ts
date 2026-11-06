/**
 * 축 ③ 도식 — 상자 선 도식이 **줄을 접지 않고**, 세로선이 **한 열로 이어지는가**.
 *
 * 둘은 성격이 다르다.
 *
 * - **접힘**은 지면 쪽 결함이다. `shikiConfig.wrap: true` 가 모든 코드블록에 `pre-wrap` 을
 *   박아서, 폭이 좁으면 도식의 긴 줄이 다음 줄로 떨어지고 그 아래가 전부 밀린다. 도식은
 *   `src/lib/shiki-diagram-blocks.mjs` 가 `code-diagram` 클래스와 `white-space: pre` 를 붙여
 *   지킨다. 같은 판별식(`DIAGRAM_CHARS`)으로 골라 그 둘이 붙었는지 본다 — 변환기가 빠지면 여기서 문다.
 * - **열 어긋남**은 원문 쪽 결함이다. 칸 서체가 맞아도 글쓴이가 공백을 하나 더 넣으면 세로선이
 *   한 칸 옆으로 꺾인다. AI 가 그린 도식에서 실제로 나왔다(②·③·⑦ 줄이 한 칸씩 밀림).
 *   렌더된 위치에서 열을 되뽑아 **위아래는 c±1 에서 이어지는데 몇 줄만 c 로 꺾인 세로선**을 낸다.
 *   위아래가 함께 꺾였으면 그 자리는 의도한 꺾임이 아니라 오타다.
 *
 * 이 함수는 `page.evaluate` 로 브라우저 안에서 돈다 — 바깥 식별자를 쓰지 않는다.
 */
export type DiagramResult = {
  diagrams: number;
  unwrapped: string[];
  jogs: { block: number; line: number; col: number; text: string }[];
};

export function measureDiagrams(arg: { diagramChars: string; verticals: string; selector: string }): DiagramResult {
  const isDiagram = new RegExp(arg.diagramChars);
  const V = new Set([...arg.verticals]);
  const out: DiagramResult = { diagrams: 0, unwrapped: [], jogs: [] };

  document.querySelectorAll(arg.selector).forEach((pre, bi) => {
    const text = pre.textContent ?? "";
    if (!isDiagram.test(text)) return;
    out.diagrams++;
    const head = text.split("\n")[0].trim().slice(0, 32);
    const ws = getComputedStyle(pre).whiteSpace;
    if (!pre.classList.contains("code-diagram") || ws !== "pre") {
      out.unwrapped.push(`#${bi + 1} «${head}» — class code-diagram ${pre.classList.contains("code-diagram") ? "있음" : "없음"} · white-space: ${ws}`);
    }

    // 열 되뽑기 — 줄마다 글자의 x 를 칸으로 나눈다. 접힌 상태에서는 x 가 의미가 없으므로
    // 잴 때만 접힘을 끈다(접힘 판정은 위에서 이미 했다).
    const prev = (pre as HTMLElement).style.whiteSpace;
    (pre as HTMLElement).style.whiteSpace = "pre";
    const code = pre.querySelector("code") ?? pre;
    const probe = document.createElement("span");
    probe.style.cssText = "position:absolute;visibility:hidden;white-space:pre";
    probe.textContent = "0".repeat(8);
    code.appendChild(probe);
    const cell = probe.getBoundingClientRect().width / 8;
    probe.remove();

    const lines = [...pre.querySelectorAll(".line")];
    const range = document.createRange();
    const grid = lines.map((line) => {
      const cols = new Map<number, string>();
      const left = line.getBoundingClientRect().left;
      const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const s = n.textContent ?? "";
        let off = 0;
        for (const ch of s) {
          if (V.has(ch)) {
            range.setStart(n, off);
            range.setEnd(n, off + ch.length);
            cols.set(Math.round((range.getBoundingClientRect().left - left) / cell), ch);
          }
          off += ch.length;
        }
      }
      return cols;
    });
    (pre as HTMLElement).style.whiteSpace = prev;

    // 세로 줄기: 같은 열에 세로 글자가 이어지는 줄 구간. 구간 바로 위·아래 줄이 같은 이웃 열
    // (c−1 또는 c+1)에 세로 글자를 갖고 있으면, 줄기가 그 구간에서만 한 칸 꺾인 것이다.
    // 단 **꺾인 쪽이 짧을 때만** 낸다 — 긴 줄기 양끝에 오타가 하나씩 있으면 긴 줄기도 같은
    // 모양으로 감싸이는데, 그쪽을 내면 맞는 줄을 고치라고 하게 된다.
    const has = (i: number, c: number) => i >= 0 && i < grid.length && grid[i].has(c);
    const runLen = (i: number, c: number) => {
      let a = i;
      let b = i;
      while (has(a - 1, c)) a--;
      while (has(b + 1, c)) b++;
      return b - a + 1;
    };
    grid.forEach((cols, i) => {
      for (const c of cols.keys()) {
        if (has(i - 1, c)) continue; // 줄기의 첫 줄에서만 본다
        let end = i;
        while (has(end + 1, c)) end++;
        for (const d of [-1, 1]) {
          const len = end - i + 1;
          if (has(i - 1, c + d) && has(end + 1, c + d) && len < runLen(i - 1, c + d) + runLen(end + 1, c + d)) {
            for (let k = i; k <= end; k++) {
              out.jogs.push({ block: bi + 1, line: k + 1, col: c, text: (lines[k].textContent ?? "").trimEnd() });
            }
          }
        }
      }
    });
  });
  return out;
}
