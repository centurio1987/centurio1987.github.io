import { visit } from "unist-util-visit";

/**
 * 본문(마크다운/MDX)의 루트 상대 내부 링크에 트레일링 슬래시를 붙인다 (KAN-055).
 *
 * 왜: Astro 의 build.format 이 "directory" 라 정본 URL 은 `/posts/foo/` 다. 본문에
 * `[EP2](/posts/vpn-anatomy-2)` 라고 적으면 GitHub Pages 가 301 로 되돌려보내고, 그
 * 왕복 1회가 View Transitions 네비게이션에서 "클릭했는데 반응 없는 시간"으로 그대로
 * 쌓인다(프로덕션 Fast 3G 실측 약 580ms). 시리즈 간 상호 참조가 독자가 실제로 가장
 * 많이 누르는 경로라 그냥 두면 손해가 크다.
 *
 * 컴포넌트 쪽 링크는 src/lib/urls.ts 가 담당한다. 본문은 글쓴이가 손으로 적으므로
 * 규칙을 기억하게 하는 대신 여기서 빌드 시 정규화한다 — 앞으로 쓸 글도 자동 적용된다.
 *
 * 건드리지 않는 것:
 *  - 외부 링크(http/mailto/tel 등), 프로토콜 상대(`//`), 순수 앵커(`#`), 쿼리만(`?`)
 *  - 이미 슬래시로 끝나는 링크
 *  - 파일을 가리키는 링크(마지막 경로 조각에 확장자가 있는 것 — /captures/ike.pcap 등)
 * 해시·쿼리는 보존한다: `/posts/x#절` → `/posts/x/#절`
 */
export function rehypeInternalLinks() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "a") return;
      const href = node.properties?.href;
      if (typeof href !== "string") return;

      // 루트 상대 경로만. `//host` 는 프로토콜 상대 URL 이므로 제외한다.
      if (!href.startsWith("/") || href.startsWith("//")) return;

      const m = /^([^?#]*)([?#].*)?$/.exec(href);
      if (!m) return;
      const path = m[1];
      const suffix = m[2] ?? "";

      if (path === "" || path.endsWith("/")) return;

      // 마지막 조각에 확장자가 있으면 파일로 보고 놔둔다.
      const last = path.slice(path.lastIndexOf("/") + 1);
      if (/\.[a-zA-Z0-9]{1,8}$/.test(last)) return;

      node.properties.href = `${path}/${suffix}`;
    });
  };
}
