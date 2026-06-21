import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { CATEGORY_SLUGS } from "./lib/categories";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(CATEGORY_SLUGS),
    tags: z.array(z.string()).default([]),
    series: z.string().optional(),
    order: z.number().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
