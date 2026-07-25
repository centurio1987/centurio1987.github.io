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
    authors.ts           # author registry (tony=사람, ppangto=AI); single source of truth
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
`title` (req), `description`, `pubDate` (req, date), `updatedDate`, `category` (req, enum), `author` (enum from `src/lib/authors.ts`, default `"tony"`), `tags` (string[]), `series`, `order`, `draft` (default false).

**Authors**: `tony` (빵관 토니, 사람) · `ppangto` (빵토 연구원, AI 완전 집필). Author appears in post meta, post lists, and as a profile card (`AuthorProfile.astro`) at the bottom of every post. If the author has `isAI: true`, an AI banner (`AiBanner.astro`, image at `public/images/authors/ai-banner.webp`) renders at the top of the post — AI가 완전 집필한 글은 frontmatter에 `author: ppangto`만 지정하면 된다.

**Series patterns** (모든 포스트에 자동 적용, `src/lib/seriesNav.ts`가 단일 소스):
- `PostNav.astro` — 이전화/다음화 카드. 시리즈 글은 `order` 기준 EP 네비게이션, 그 외는 발행일 기준.
- `SeriesEpisodes.astro` — "지난 에피소드" 카드 그리드. 같은 `series` 글이 2개 이상일 때 렌더링, 현재 화 하이라이트, 썸네일은 `/images/<slug>/hero.webp` (없으면 해칭).

**폭신 대담 (인터뷰 시리즈)**: frontmatter `template: "talk"`로 활성화되는 인터뷰 레이아웃 (`TalkLayout.astro`). 구성: 대담 배너(`public/images/talk/banner.webp`, 없으면 생략) → 시리즈·EP 헤더 → 화자 듀오(글쓴이 × 빵토 교수님) → 오늘의 질문 목차(QA에서 자동 생성) → Q&A 본문 → 태그 → PostNav/SeriesEpisodes/AuthorProfile/RelatedPosts. 본문은 MDX 컴포넌트 `<QA n q>`·`<PullQuote>` (`src/components/talk/`)로 쓴다. 화자·배너 설정은 `src/lib/talk.ts`. 에피소드 템플릿은 자산으로 `src/templates/talk-episode.mdx`에 관리한다 — 새 에피소드는 `init-post --talk`가 이 템플릿을 `src/content/posts/`로 복사해 스캐폴드한다.

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
  → make-image    (```viz``` blocks → bbangto-ui-visualization components; inline SVG + hero webp)
  → post-finalize (tags, series links, <<meme:>> delegation — NO image generation)
  → publish-post  → src/content/posts/<slug>.mdx  (sets Astro frontmatter, deletes draft)
```

### Visuals: bbangto-ui-visualization (viz engine) — NOT ChatGPT

All structured visuals (diagrams, charts, infographics, and the hero image) are **implemented directly in code** from the user's design-system package **`@centurio1987/bbangto-ui-visualization`** — the blog does **not** call ChatGPT/OpenAI for images (KAN-013).

- Authors leave a fenced ```` ```viz``` ```` block (JSON: `kind` + `data` + `caption`/`alt`). `make-image`/`image-maker` runs `scripts/apply-viz.ts`:
  - `target:"inline"` (default) → co-located `src/components/posts/<slug>/<Name>.tsx` (wraps a package component in `VizFigure`) + MDX import + `<Name />` — renders as **SSR static SVG, no hydration** (zero-JS paint via the global contract shim `src/styles/viz.css`).
  - `target:"hero"` → `scripts/render-viz.ts` (SSR → Playwright → cwebp/sharp) writes `public/images/<slug>/hero.webp` (also the OG/series-thumbnail raster).
- v1 kinds (`src/lib/viz/schema.ts`, Zod): `ProcessSteps` · `Comparison` · `Flowchart` · `Statistics` · `PosterEditorial`. Blog style guide: `src/lib/viz/blogVizStyleGuide.ts` (bound to tokens + `design-concept/DIAGRAM_STYLE_GUIDE.md`).
- **GitHub Packages**: the package lives on `npm.pkg.github.com`. Project `.npmrc` only maps the `@centurio1987` scope → auth comes from your **global `~/.npmrc`** `read:packages` token, so local dev needs **no per-project setup** (`bun install` just works). CI (`main.yml`, `packages: read`) writes the token to `~/.npmrc` before install (`PACKAGES_READ_TOKEN` PAT if set, else the workflow `GITHUB_TOKEN`). Verify inline paint over **`astro preview` (HTTP)**, not `file://`.
- **Legacy (retired)**: `[[[…]]]`(OpenAI), ```figure```(make-image HTML templates), `(( ))`(mdx-concept-diagram) → all replaced by ```viz```. `scripts/generate-image.ts` / `render-image.ts` / `image-templates.ts` are deprecated stubs (delete in a follow-up).

- `init-post` — skip the raws→draft pipeline: scaffold a ready-to-write post directly in `src/content/posts/` (draft:true).
- `publish-post` does NOT edit any nav/sidebar config — the collection auto-discovers.

## Notes

- `.obsidian/` (vault config) may exist — do not delete unless asked; the notes vault is separate from the site build.
- Deployment: `.github/workflows/main.yml` (Bun + `astro build` → GitHub Pages on push to `main`).
