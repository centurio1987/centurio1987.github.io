# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Use **Bun** as the package manager (not npm or yarn).

```bash
bun install          # Install dependencies
bun docs:dev         # Start development server
bun docs:build       # Build for production (outputs to .vitepress/dist)
bun docs:preview     # Preview the production build
```

There are no test commands — this project has no test suite.

## Architecture

This is a **VitePress** personal portfolio site (Vue 3 + TypeScript) deployed to GitHub Pages via GitHub Actions on push to `main`.

### Directory layout

```
/.vitepress/
  config.ts          # Site config: nav, sidebar, theme settings
  theme/
    index.ts         # Theme entry point — registers global components
    main.css         # Global styles (glassmorphism, dark theme vars)
    custom/          # Layout overrides (Layout.vue, PortfolioLayout.vue)
/docs/
  components/        # Vue SFCs used in markdown pages
  posts/             # Markdown articles organized by category
  public/            # Static assets served as-is (images, videos)
  *.md               # Top-level pages (index, resume, portfolio, etc.)
```

### Key configuration

- **Forced dark mode**: `appearance: "force-dark"` in `config.ts`
- **Sidebar**: Korean category names (기획, 아키텍처, 전략, 기술, 설계, 리서치, 품질, 리더십) mapping to `/docs/posts/` subdirectories
- **Deployment**: `.github/workflows/main.yml` builds with `bun docs:build` and deploys `.vitepress/dist` to GitHub Pages

### Component patterns

- Vue components live in `/docs/components/` and are registered globally in `.vitepress/theme/index.ts` so they can be used directly in markdown files
- Styling uses scoped `<style>` blocks with CSS custom properties; glassmorphism effects (backdrop-filter, transparency, borders) are the visual motif
- GSAP is used for scroll-triggered animations in components like `Value.vue` and `PortfolioV3.vue`
- Data for sections like the resume (`Resume2.vue`) is defined as typed TypeScript interfaces and arrays inline in the `<script setup>` block

### Content

- Posts are written in Markdown under `/docs/posts/<category>/`
- New posts must also be registered in the `sidebar` array in `/.vitepress/config.ts` to appear in navigation
- The `.obsidian/` folder exists because the docs vault doubles as an Obsidian notebook — do not delete it
