// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import { unified } from "@astrojs/markdown-remark";

import { rehypeWrapTables } from "./src/lib/rehype-wrap-tables.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://centurio1987.github.io",
  integrations: [sitemap(), mdx(), react()],
  markdown: {
    // Astro 7의 기본 마크다운 파이프라인은 Sätteri지만, 이 블로그는 remark/rehype
    // 플러그인(rehypeWrapTables)에 의존하므로 unified() 프로세서를 명시해 유지한다.
    // 플러그인은 unified()에 직접 넘긴다 — 최상위 rehypePlugins는 deprecated.
    processor: unified({ rehypePlugins: [rehypeWrapTables] }),
    shikiConfig: {
      theme: "github-light",
      wrap: true,
    },
  },
});