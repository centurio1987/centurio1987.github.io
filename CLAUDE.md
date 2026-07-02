# CLAUDE.md

This file provides guidance to Claude when working with code in this repository.

## What this is

A writing-focused personal blog (빵관 토니 — "Serious Work, Joyful Wit"), built with **Astro** and deployed to GitHub Pages. Resume/portfolio/value sections were removed; the site exists to publish posts. Design language is defined in `design-concept/DESIGN_CONCEPT.md` (v0.2: light, earthy palette, all sans-serif, hand-drawn motifs).

## Commands

CI uses **Bun**; locally either works.

```bash
bun install        # or: npm install
bun dev            # or: npm run dev      — dev server
bun run build      # or: npm run build    — static build to dist/
bun run preview    # or: npm run preview  — preview the build
```

No test suite. Verify by building (`build`) and previewing.

## Architecture

Astro static site. Source lives entirely under `src/`; `public/` is served at the site root.

```
/astro.config.mjs        # site URL, sitemap integration, markdown (Shiki) config
/src/
  content.config.ts      # `posts` collection: glob loader + Zod frontmatter schema
  content/posts/         # published posts (*.md) — THE content
  lib/
    categories.ts        # 8 category slugs → {label, color}; single source of truth
    format.ts            # date / reading-time helpers
  styles/
    tokens.css           # design tokens (DESIGN_CONCEPT.md v0.2)
    global.css           # base styles, fonts (Pretendard/JetBrains Mono), sketch underline
  layouts/               # BaseLayout, PostLayout
  components/            # Header, Footer, PostList, CategoryBadge, Logo
    motifs/              # hand-drawn SVGs: Sparkle, Squiggle, Mascot
  pages/                 # index, posts/index, posts/[...slug], categories/[category], 404
/public/                 # favicon, generated post images (/images/<slug>/*.webp)
/raws/                   # USER-authored idea fragments (input to writing workflow)
/draft/                  # scaffolds + in-progress posts (pre-publish)
```

### Content model

Posts are markdown in `src/content/posts/`. Frontmatter schema (`src/content.config.ts`):
`title` (req), `description`, `pubDate` (req, date), `updatedDate`, `category` (req, enum), `tags` (string[]), `series`, `order`, `draft` (default false).

`category` must be one of the slugs in `src/lib/categories.ts`:
`planning` 기획 · `architecture` 아키텍처 · `strategy` 전략 · `skills` 기술 · `design` 설계 · `research` 리서치 · `quality` 품질 · `leadership` 리더십.

Posts are **auto-discovered** — no sidebar/nav registration needed. A post's URL is `/posts/<file-slug>`; categories list at `/categories/<slug>`. `draft: true` hides a post from listings.

### Graph data (연관 글 · /graph 글 지도)

Related-posts sections and the `/graph` explorer are powered by a graphify knowledge graph:

```
/graphify src/content/posts/          → graphify-out/graph.json (+labels, manifest)  [committed]
bun scripts/build-graph-data.ts       → src/data/graph.json (distilled)              [committed]
astro build                           → consumes src/data/graph.json only (no LLM, no key)
```

- **Contract**: CI/`astro build` never runs graphify — it only imports the committed `src/data/graph.json` (via `src/lib/graph.ts`, a glob loader). If the file is missing, the build still passes: related posts degrade to frontmatter-only ranking (series/tags/category, `src/lib/related.ts`) and `/graph` falls back to a plain post list.
- **Regeneration** happens at publish time (ship-post step 1.5, non-blocking) or manually with the command pair above. graphify's markdown extraction is LLM-based (`GEMINI_API_KEY`), so it must stay out of CI.
- `scripts/build-graph-data.ts` is idempotent; commit `graphify-out/` (incl. `manifest.json` for incremental `--update`) together with `src/data/graph.json`.

### Design

All visual decisions follow `design-concept/DESIGN_CONCEPT.md` and are implemented as CSS variables in `src/styles/tokens.css`. Keep the reading surface calm; wit lives at the edges (hero, footer, 404, hover, the Tony mascot). Hand-drawn motifs are SVG components under `src/components/motifs/`.

## Writing workflow (skills in `.claude/skills/`)

```
raws/<memo>.md   (user writes idea fragments)
  → post-draft    → draft/<memo>-draft.md   (3 plot candidates + topic cautions)
  → user picks a plot, writes the body
  → review-post   (4-axis Korean review: 맞춤법/개연성/테크니컬 라이팅/몰입도)
  → post-finalize ([[[image clues]]] → public/images webp, tags, series links)
  → publish-post  → src/content/posts/<slug>.md  (sets Astro frontmatter, deletes draft)
```

- `init-post` — skip the raws→draft pipeline: scaffold a ready-to-write post directly in `src/content/posts/` (draft:true).
- `post-finalize` uses `scripts/generate-image.ts` (needs `OPENAI_API_KEY`); images go to `public/images/<slug>/` and are referenced as `/images/<slug>/...`.
- `publish-post` does NOT edit any nav/sidebar config — the collection auto-discovers.

## Notes

- `.obsidian/` (vault config) may exist — do not delete unless asked; the notes vault is separate from the site build.
- Deployment: `.github/workflows/main.yml` (Bun + `astro build` → GitHub Pages on push to `main`).
