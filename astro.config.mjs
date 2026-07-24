// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

import mdx from "@astrojs/mdx";
import react from "@astrojs/react";

import { rehypeWrapTables } from "./src/lib/rehype-wrap-tables.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://centurio1987.github.io",
  integrations: [sitemap(), mdx(), react()],
  markdown: {
    shikiConfig: {
      theme: "github-light",
      wrap: true,
    },
    rehypePlugins: [rehypeWrapTables],
  },
});