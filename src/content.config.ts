import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { CATEGORY_SLUGS } from "./lib/categories";
import { AUTHOR_IDS, DEFAULT_AUTHOR } from "./lib/authors";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(CATEGORY_SLUGS),
    author: z.enum(AUTHOR_IDS).default(DEFAULT_AUTHOR),
    tags: z.array(z.string()).default([]),
    series: z.string().optional(),
    order: z.number().optional(),
    draft: z.boolean().default(false),
    /** 포스트 템플릿 — "talk"는 폭신 대담(인터뷰) 레이아웃 */
    template: z.enum(["default", "talk"]).default("default"),
  }),
});

export const collections = { posts };
