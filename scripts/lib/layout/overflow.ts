/**
 * 축 ① 지면 넘침 — 지면이 뷰포트보다 넓어져 **페이지 전체가** 가로로 밀리는가.
 *
 * 코드블록·표는 자기 안에서 가로로 스크롤하도록 짜여 있다(`overflow-x: auto`). 그런데 그 블록을
 * 감싼 flex 자식에 `min-width: 0` 이 없으면 자식의 최소 폭이 내용물의 최소 폭이 되어, 블록이
 * 스크롤하는 대신 **부모 칸을 끌고** 화면 밖으로 나간다. 문단까지 같이 밀려 모바일에서 글
 * 오른쪽이 잘린다(talk-crdt-room-optimization: 390px 지면이 779px).
 *
 * 판정은 `scrollWidth > clientWidth` 하나다. 범인은 **넘친 요소 중 가장 바깥 것**으로 짚는다 —
 * 조상 중 하나가 `overflow-x` 로 잘라 주고 있으면 지면 넘침이 아니므로 뺀다.
 *
 * 이 함수는 `page.evaluate` 로 브라우저 안에서 돈다 — 바깥 식별자를 쓰지 않는다.
 */
export type OverflowResult = { vw: number; sw: number; culprits: string[] };

export function measureOverflow(): OverflowResult {
  const vw = document.documentElement.clientWidth;
  const sw = document.documentElement.scrollWidth;
  if (sw <= vw + 1) return { vw, sw, culprits: [] };

  const describe = (el: Element) => {
    const one = (e: Element) => {
      const cls = (e.getAttribute("class") ?? "").trim().split(/\s+/)[0];
      return e.tagName.toLowerCase() + (cls ? "." + cls : "");
    };
    const chain = [one(el)];
    let p = el.parentElement;
    for (let i = 0; i < 2 && p && p !== document.body; i++, p = p.parentElement) chain.push(one(p));
    return chain.join(" ← ");
  };
  const clippedByAncestor = (el: Element) => {
    for (let p = el.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
      if (getComputedStyle(p).overflowX !== "visible") return true;
    }
    return false;
  };
  const over = (el: Element | null) => !!el && el.getBoundingClientRect().right > vw + 1;

  const culprits: string[] = [];
  for (const el of document.body.querySelectorAll("*")) {
    if (!over(el) || el.getBoundingClientRect().width === 0) continue;
    if (clippedByAncestor(el)) continue;
    // 가장 바깥 것만 — 부모도 넘쳤으면 부모가 범인이다(body·html 은 제외).
    const parent = el.parentElement;
    if (parent && parent !== document.body && over(parent)) continue;
    culprits.push(`${describe(el)} (오른쪽 끝 ${Math.round(el.getBoundingClientRect().right)}px)`);
    if (culprits.length >= 4) break;
  }
  return { vw, sw, culprits };
}
