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

A writing-focused personal blog (빵관 토니 — "Serious Work, Joyful Wit"), built with **Astro** and deployed to GitHub Pages. Resume/portfolio/value sections were removed; the site exists to publish posts. Design language is defined in `design-concept/DESIGN_CONCEPT.md` (v0.2: light, earthy palette, all sans-serif, hand-drawn motifs).

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
    tokens.css           # design tokens (DESIGN_CONCEPT.md v0.3)
    global.css           # base styles, fonts (Jua/Gowun Dodum/Gaegu/Space Mono/JetBrains Mono), sketch underline
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

All visual decisions follow `design-concept/DESIGN_CONCEPT.md` and are implemented as CSS variables in `src/styles/tokens.css`. Keep the reading surface calm; wit lives at the edges (hero, footer, 404, hover, the Tony mascot). Hand-drawn motifs are SVG components under `src/components/motifs/`.

## Writing Workflow

Project-local Codex skills live in `.codex/skills/` and mirror the previous Claude writing workflow.

```text
raws/<memo>.md   (user writes idea fragments)
  → post-draft    → draft/<memo>-draft.md   (3 plot candidates + topic cautions)
  → user picks a plot, writes the body
  → review-post   (4-axis Korean review: 맞춤법/개연성/테크니컬 라이팅/몰입도)
  → post-finalize (tags, series links, <<meme:>> delegation — no image generation)
  → publish-post  → src/content/posts/<slug>.md  (sets Astro frontmatter, deletes draft)
```

- `init-post` — skip the raws→draft pipeline: scaffold a ready-to-write post directly in `src/content/posts/` (`draft: true`).
- Structured visuals are `viz` blocks implemented by the `image-maker` path (viz engine, `@centurio1987/bbangto-ui-visualization`) via `scripts/apply-viz.ts` → co-located `.tsx` (SSR static SVG) for inline and `scripts/render-viz.ts` → `public/images/<slug>/hero.webp` for hero. No ChatGPT/OpenAI image generation. `post-finalize` no longer generates images; it does tags, series links, and `<<meme:>>` delegation only.
- `publish-post` does not edit any nav/sidebar config because the Astro collection auto-discovers posts.

### End-to-End Technical Article Publishing

For requests that explicitly ask to write a technical article and publish it end to end, use the
`tech-article-publisher` subagent. It orchestrates the project-local skills in this order:

```text
research -> tech-deepdive -> review-post -> review-writing -> quality-gate
  -> post-finalize -> publish-post -> ship-post
```

- Do not use the orchestrator for draft-only, review-only, finalize-only, or publish-only requests.
- Ask once whether to run automatically or gate each stage. In automatic mode, that choice also approves
  publication and push, but it never bypasses writing-quality or technical-quality gates.
- Use `research-gatherer` for source collection and wiki ingest unless the subject is a pure tutorial or
  personal retrospective where external research adds no value.
- Respect every gate: external review status, agreed critical review fixes, `review-writing` `PASS`,
  `quality-gate` `PASS`, and explicit publication approval in interactive mode.
- If either quality gate still fails after three rounds, stop publication and report the remaining gaps.
- Delegate React simulations to `react-sim-builder` and structured information graphics to `image-maker`.
- **Do not delegate commits or pushes.** Call `scripts/git-commit-push.sh` yourself with explicit paths,
  never `git add -A` and never `--force`. A delegated shipper once rewrote that guard script instead of
  calling it, and pushed the change (`4689cf5`, reverted in `7295e9a`) — writing the rule into the agent
  definition did not prevent it. If the script exits non-zero, report its output and stop; do not fix the script.
- For a series, complete one article per pipeline run and ask before starting the next article.
- When interrupted, report the draft path and the last completed gate so the workflow can resume.

### Migrated Claude Agent Roles

The Claude role definitions under `.claude/agents/` map to these Codex responsibilities:

- `tech-article-publisher`: orchestrate research, writing, reviews, publication, verification, and push.
- `research-gatherer`: collect cited sources, persist immutable research, and produce an angle page.
- `post-reviewer`: perform the four-axis sentence-level Korean review and apply only unambiguous fixes.
- `writing-reviewer`: judge persuasion, logic, structure, and house style without changing technical facts.
- `quality-gate-checker`: enforce technical depth, completeness, multiple perspectives, accuracy, and build checks.
- `react-sim-builder`: create co-located React simulations and verify type-check/build results.
- `image-maker`: implement fenced `viz` specifications as structured visuals via the bbangto-ui-visualization viz engine (inline `.tsx` SSR SVG / hero webp); no ChatGPT image generation.
- `git-shipper`: **retired.** Commits and pushes are never delegated — the acting session calls
  `scripts/git-commit-push.sh` directly. See `.claude/agents/git-shipper.md` for why.

Claude `sonnet`, `haiku`, and `inherit` model labels are role hints, not valid Codex model identifiers.
Codex agent configuration must inherit the active OpenAI model unless the user explicitly selects a valid
OpenAI model. Claude tool allowlists are likewise behavioral constraints to preserve in agent instructions,
not keys to copy verbatim into Codex configuration.

## Notes

- `.obsidian/` may exist. Do not delete it unless asked; the notes vault is separate from the site build.
- Deployment is `.github/workflows/main.yml` (Bun + `astro build` → GitHub Pages on push to `main`).
