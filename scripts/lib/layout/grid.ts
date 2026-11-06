/**
 * 축 ② 칸 — 코드블록의 글자가 전부 **고정폭 칸의 1배나 2배**로 그려지는가.
 *
 * 코드블록의 도식과 열 맞춘 출력은 글자 하나가 칸 하나(한글은 두 칸)를 차지한다는 전제로
 * 쓰인다. 스택의 어느 서체가 그 글자를 그리는지에 따라 이 전제가 조용히 깨진다 — 구글
 * JetBrains Mono 에 상자 선·한글이 없어 본문 서체로 떨어지던 동안 `─` 는 1.67칸, `가` 는
 * 1.52칸이었다. 서체 파일 하나가 404 여도(새 서체를 굽고 빌드를 안 다시 돌리면 그렇다)
 * 같은 모양으로 깨진다. **어느 경우든 빌드·타입·토큰 게이트는 초록이다.**
 *
 * 판정: 코드블록마다 그 안에 나온 글자를 하나씩 재서 `폭 / 칸` 이 1 이나 2 에서 4% 넘게
 * 벗어나면 위반이다. 칸은 같은 자리에서 잰 `0` 의 폭이다. 글자를 낱개로 재는 것은
 * JetBrains Mono 의 합자(`->`)가 줄 단위 합계를 흐리기 때문이다.
 * 서체가 못 온 경우(`FontFace.status === "error"`)도 함께 낸다 — 원인이 거기 있다.
 *
 * 이 함수는 `page.evaluate` 로 브라우저 안에서 돈다 — 바깥 식별자를 쓰지 않는다.
 */
export type GridResult = {
  fontErrors: string[];
  blocks: number;
  offGrid: { block: number; head: string; chars: string[] }[];
};

export async function measureGrid(selector: string): Promise<GridResult> {
  await document.fonts.ready;
  const pres = [...document.querySelectorAll(selector)];
  // 접힌 자리(<details> 등)의 코드는 렌더가 안 돼 서체 요청이 안 나간다 — 재기 전에 직접 부른다.
  for (const pre of pres) {
    const code = pre.querySelector("code") ?? pre;
    const text = [...new Set([...(code.textContent ?? "")])].join("");
    await document.fonts.load(getComputedStyle(code).font, text).catch(() => []);
  }
  const fontErrors = [...document.fonts]
    .filter((f) => f.status === "error")
    .map((f) => `${f.family.replace(/"/g, "")} ${f.weight}`);

  const offGrid: GridResult["offGrid"] = [];
  pres.forEach((pre, i) => {
    const code = pre.querySelector("code") ?? pre;
    const text = code.textContent ?? "";
    const probe = document.createElement("span");
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText = "position:absolute;visibility:hidden;white-space:pre;font-variant-ligatures:none";
    code.appendChild(probe);
    const advance = (s: string) => {
      probe.textContent = s.repeat(8);
      return probe.getBoundingClientRect().width / 8;
    };
    const cell = advance("0");
    const bad: string[] = [];
    for (const ch of new Set([...text])) {
      // 공백, 그리고 폭이 0 인 결합·서식 문자(`⚠️` 의 변이 선택자 U+FE0F 등)는 칸이 없다.
      if (!ch.trim() || /[\p{Mn}\p{Me}\p{Cf}]/u.test(ch)) continue;
      const n = advance(ch) / cell;
      const k = Math.round(n);
      if (k < 1 || k > 2 || Math.abs(n - k) > 0.04) bad.push(`${ch}(${n.toFixed(2)}칸)`);
    }
    probe.remove();
    if (bad.length) offGrid.push({ block: i + 1, head: text.split("\n")[0].trim().slice(0, 32), chars: bad });
  });
  return { fontErrors, blocks: pres.length, offGrid };
}
