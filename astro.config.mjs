// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import { unified } from "@astrojs/markdown-remark";

import { rehypeWrapTables } from "./src/lib/rehype-wrap-tables.mjs";
import { rehypeInternalLinks } from "./src/lib/rehype-internal-links.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://centurio1987.github.io",
  integrations: [sitemap(), mdx(), react()],
  // ClientRouter(View Transitions)를 쓰면 prefetch 가 암묵적으로 켜지는데, 그 기본값에
  // 기대지 않고 여기 명시해 고정한다(KAN-055). hover 를 기본으로 두는 이유는 마우스
  // 사용자에게 200ms~2초의 선행 시간을 주기 때문이다 — tap(mousedown/touchstart)은
  // 클릭 직전 100ms 남짓이라 이득이 훨씬 작다. 터치 기기는 hover 가 없어 혜택이 0이므로,
  // 의도가 가장 확실한 이전화/다음화 링크에만 data-astro-prefetch="viewport" 를 달아
  // 화면에 들어온 시점에 미리 받아둔다(PostNav.astro). 목록 전체에 viewport 를 걸지 않는
  // 것은 글 24편 × 약 40KB 를 모바일 데이터로 긁어오는 비용이 이득보다 크기 때문이다.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  markdown: {
    // Astro 7의 기본 마크다운 파이프라인은 Sätteri지만, 이 블로그는 remark/rehype
    // 플러그인(rehypeWrapTables)에 의존하므로 unified() 프로세서를 명시해 유지한다.
    // 플러그인은 unified()에 직접 넘긴다 — 최상위 rehypePlugins는 deprecated.
    processor: unified({ rehypePlugins: [rehypeWrapTables, rehypeInternalLinks] }),
    shikiConfig: {
      theme: "github-light",
      wrap: true,
    },
  },
});