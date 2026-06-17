# AGENTS.md

This file provides guidance to Codex when working with code in this repository.

## Global Codex Workflow

### Plan Mode External Review

In Plan mode, after writing the plan file and immediately before leaving Plan mode, always perform this review gate unless the user has already explicitly declined external review:

1. Ask one question:
   - Question: "이 플랜에 대해 ChatGPT/Gemini의 외부 검토를 받을까요?"
   - Header: "외부 검토"
   - Options:
     - "ChatGPT/Gemini 검토 (Recommended)" — "`review-plan` 스킬로 두 모델의 의견을 받아본 뒤 플랜을 보완할 기회 제공"
     - "바로 승인 단계로" — "검토를 건너뛰고 `ExitPlanMode` 호출"
2. If the user chooses external review, use the `review-plan` skill.
3. Show the review result. If the user wants changes, edit the plan file and ask the same review question once more. If the user chooses "바로 승인 단계로", leave Plan mode immediately to avoid an infinite loop.
4. If the user chooses "바로 승인 단계로" initially, leave Plan mode without further questions.

## What This Is

A writing-focused personal blog (빵관 토니 — "Serious Work, Joyful Wit"), built with **Astro** and deployed to GitHub Pages. Resume/portfolio/value sections were removed; the site exists to publish posts. Design language is defined in `DESIGN_CONCEPT.md` (v0.2: light, earthy palette, all sans-serif, hand-drawn motifs).

## Commands

CI uses **Bun**; locally either Bun or npm works.

```bash
bun install        # or: npm install
bun dev            # or: npm run dev      — dev server
bun run build      # or: npm run build    — static build to dist/
bun run preview    # or: npm run preview  — preview the build
```

No test suite exists. Verify changes by building (`bun run build` or `npm run build`) and previewing.

## Architecture

Astro static site. Source lives entirely under `src/`; `public/` is served at the site root.

```text
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

## Content Model

Posts are markdown in `src/content/posts/`. Frontmatter schema (`src/content.config.ts`):
`title` (required), `description`, `pubDate` (required date), `updatedDate`, `category` (required enum), `tags` (string[]), `series`, `order`, `draft` (default false).

`category` must be one of the slugs in `src/lib/categories.ts`:
`planning` 기획 · `architecture` 아키텍처 · `strategy` 전략 · `skills` 기술 · `design` 설계 · `research` 리서치 · `quality` 품질 · `leadership` 리더십.

Posts are auto-discovered. No sidebar/nav registration is needed. A post URL is `/posts/<file-slug>`; categories list at `/categories/<slug>`. `draft: true` hides a post from listings.

## Design

All visual decisions follow `DESIGN_CONCEPT.md` and are implemented as CSS variables in `src/styles/tokens.css`. Keep the reading surface calm; wit lives at the edges (hero, footer, 404, hover, the Tony mascot). Hand-drawn motifs are SVG components under `src/components/motifs/`.

## Writing Workflow

Project-local Codex skills live in `.codex/skills/` and mirror the previous Claude writing workflow.

```text
raws/<memo>.md   (user writes idea fragments)
  → post-draft    → draft/<memo>-draft.md   (3 plot candidates + topic cautions)
  → user picks a plot, writes the body
  → review-post   (4-axis Korean review: 맞춤법/개연성/테크니컬 라이팅/몰입도)
  → post-finalize ([[[image clues]]] → public/images webp, tags, series links)
  → publish-post  → src/content/posts/<slug>.md  (sets Astro frontmatter, deletes draft)
```

- `init-post` — skip the raws→draft pipeline: scaffold a ready-to-write post directly in `src/content/posts/` (`draft: true`).
- `post-finalize` uses `scripts/generate-image.ts` and requires `OPENAI_API_KEY`; images go to `public/images/<slug>/` and are referenced as `/images/<slug>/...`.
- `publish-post` does not edit any nav/sidebar config because the Astro collection auto-discovers posts.

## Notes

- `.obsidian/` may exist. Do not delete it unless asked; the notes vault is separate from the site build.
- Deployment is `.github/workflows/main.yml` (Bun + `astro build` → GitHub Pages on push to `main`).
