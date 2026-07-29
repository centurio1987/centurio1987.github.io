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
bun run graph:refresh   (= scripts/refresh-graph.sh, main 워크트리 전용)
  ├ graphify extract src/content/posts/ … --out .  → graphify-out/graph.json          [committed]
  ├ scripts/seed-graph-cache.py                    → graphify-out/cache/semantic/     [committed]
  ├ graphify label . --missing-only --no-viz       → .graphify_labels.json            [committed]
  ├ bun scripts/build-graph-data.ts                → src/data/graph.json (distilled)  [committed]
  └ bun scripts/verify-graph.ts --log …            → 커밋해도 되는지 판정 (비0 = 폐기)
astro build                                        → consumes src/data/graph.json only (no LLM, no key)
```

- **Contract**: CI/`astro build` never runs graphify — it only imports the committed `src/data/graph.json` (via `src/lib/graph.ts`, a glob loader). If the file is missing, the build still passes: related posts degrade to frontmatter-only ranking (series/tags/category, `src/lib/related.ts`) and `/graph` falls back to a plain post list.
- **`/graph` 뷰 규약 (KAN-029)**: 지도에 그려지는 노드는 **글뿐**이다. 개념·키워드 노드는 초기 렌더에 없고, 글 노드에 hover/focus(터치는 첫 탭)했을 때만 그 글의 **연관 키워드 부채**로 펼쳐진다(상위 8개, `degree` 순). 글↔글 엣지는 세 신호를 한 쌍으로 합친 것 — ① 개념 공유(`postPairs.score`) ② 본문 인용(문서 노드 간 직접 엣지, 자기참조 제외) ③ 같은 시리즈의 **이웃 화**(클리크가 아니라 `order` 체인). 그래프에 아직 없는 글은 키워드가 frontmatter `tags`로 degrade 하므로 hover가 빈손이 되지 않는다. 검색은 개념 노드가 사라져도 유지된다(글마다 전체 개념 라벨을 `searchText`로 접어 보냄). 합성·필터링은 `src/pages/graph.astro`, 렌더·인터랙션은 `src/components/graph/GraphExplorer.tsx`.
- **Regeneration은 main 워크트리에서만** (KAN-046, KAN-044 대체). 발행(ship-post)은 그래프를 건드리지 않는다 — 산출물이 커밋 대상이라 병렬 워크트리가 각자 갱신하면 1MB JSON이 다중 충돌하고, 각 워크트리엔 자기 편만 있어 만든 그래프가 형제 편 머지 즉시 stale이 된다. main 머지 후 `bun run graph:refresh`를 한 번 돌린다. `refresh-graph.sh`가 브랜치·워크트리·graphify 버전을 가드하므로 다른 데서는 실행 자체가 막힌다(`ALLOW_GRAPH_REFRESH_NON_MAIN=1`로만 우회). graphify의 markdown 추출은 LLM 기반이라 CI에는 절대 들어가지 않는다.
- **증분 추출의 상태는 `graphify-out/cache/semantic/` 하나다 — 절대 gitignore 하지 마라 (KAN-046).** graphify는 콘텐츠 해시 캐시로 LLM 호출 **전에** 안 바뀐 글을 걸러낸다. 캐시가 없으면 매 실행이 전량 재추출이다(24편 기준 **1.26M in / 280k out / 40~60분**). 실측: 캐시 적중 시 같은 코퍼스가 **34,657 in → 0 토큰**, 그래프는 노드·엣지 수까지 동일.
  - 그런데 graphify 0.9.4는 **이 레포 레이아웃에서 캐시를 스스로 못 쓴다.** `save_semantic_cache()`가 `out_root/<source_file>`이 실재하는지 보는데, `source_file`은 **스캔 루트**(`src/content/posts/`) 기준 상대경로이고 `--out .`은 레포 루트라 경로가 안 맞아 통째로 skip된다. 그래서 `scripts/seed-graph-cache.py`가 추출 직후 `source_file`을 절대경로로 바꿔 graphify **자신의** `save_semantic_cache(root=레포루트)`에 넘겨 심는다(해시 계산은 graphify 함수를 그대로 쓰므로 재구현 없음). 이 단계를 빼면 조용히 예전 비용으로 되돌아간다.
  - **`manifest.json`은 커밋하지 않는다**(gitignore). 같은 종류의 절대/상대 불일치가 `_manifest_files`에도 있어 문서 코퍼스에서는 **항상 `{}`**로 쓰인다. 빈 채로 존재하기만 해도 `incremental_mode`가 켜져 `build_merge` 경로를 타는데, 삭제 감지가 죽어 **지운 글의 노드가 그래프에 영원히 남는다.** 파일이 없으면 매 실행 캐시에서 온전히 재구성돼 삭제가 자연히 반영된다.
  - **`.mdx`는 프론트매터까지 해시된다** (`cache.py`의 프론트매터 스트립은 `.md`에만 적용). 그래서 `post-finalize`의 `tags`·`updatedDate` 갱신이나 시리즈 링크 섹션 삽입도 그 글(형제 편 포함)의 재추출을 유발한다. 본문이 안 바뀌었는데 왜 다시 도나 싶으면 이것이다.
- **Backend (KAN-023에서 확정)**: `--backend claude-cli`(로컬 Claude Code에 위탁, API 키 불필요)를 기본으로 쓴다. `--backend gemini`(`GEMINI_API_KEY`)는 **무료 티어가 5 RPM·일일 상한**이라 18편 전량 추출이 청크 절반 이상 429로 실패한다 — 부분 결과가 조용히 커밋되면 일부 글이 통째로 그래프에서 빠진다. gemini를 쓸 거면 청크 수를 5 이하로 유지(`--token-budget` 기본값)하고 **`N/N done`을 반드시 확인**할 것.
- **검증은 `scripts/verify-graph.ts` 하나로 한다**(KAN-028에서 스크립트화, `graph:refresh`가 자동 호출). 손으로 세지 말 것 — 비0으로 끝나면 그 graph.json은 버린다. 다섯 겹으로 본다: ⓪ 로그의 `n/m semantic chunk(s) failed` WARNING(뜨면 그 자체로 폐기) · ① 커버리지(모든 글이 자기 `source_file`로 그래프에 등장) · ② **껍데기 없음**(글당 노드 ≥2) · ③ 증류 커버리지(`src/data/graph.json`의 `posts`에 모든 글) · ④ **증분 상태**(캐시 항목이 글 수 이상 + 이번 실행 캐시·토큰 통계). ②가 핵심이다 — 청크가 실패하면 글이 *사라지는* 게 아니라 **문서 노드만 남고 개념·관계가 0개인 껍데기**가 되어 ①을 거짓 통과한 뒤 연관 글·`/graph`에서 투명인간이 된다. ④는 **다음 실행**을 지킨다. `--log`를 안 넘기면 ⓪가 생략되니 항상 `tee`로 로그를 남긴다(`graph:refresh`가 `graphify-out/logs/`에 남긴다).
- **노드 ID 충돌은 실패가 아니다 (KAN-028).** 시리즈 글이 서로를 인용하면 `[graphify] WARNING: node 'X' … the second node will be dropped`가 뜬다. graphify는 "같은 이름 파일이 다른 디렉터리에 있는 탓"이라며 하위 폴더별 extract + `merge-graphs`를 권하지만 **이 레포에선 쓰지 마라** — cross-post 링크가 전부 같은 시리즈 안에서 나므로(cross-series 0) 시리즈 단위 분할은 충돌을 못 잡고, 파일 단위 분할은 그 링크(=`postPairs` 신호 전부)를 잃으며, `merge-graphs`는 `prefix_graph_for_global`로 모든 ID를 `tag::id`로 바꿔 증류 스크립트와 커뮤니티 라벨까지 깨뜨린다. 실제로는 **참조 문서 노드와 진짜 문서 노드가 같은 글을 가리키는 같은 실체**라 병합이 옳고, 엣지도 survivor로 재배선돼 손실이 없다. `build-graph-data.ts`가 문서 노드를 **가리키는 글**로 정규화해(`representedPostSlug`: ①id 정확일치 `<slug>`/`<slug>_post` ②id 접두사 + 라벨↔제목 포함) 충돌을 흡수한다 — 확신이 없으면 `source_file` 폴백으로 남겨 외부 문서(OWASP·Keycloak 등)를 글로 오인하지 않는다. 이 정규화가 없으면 글↔글 인용 엣지가 전부 자기루프가 되어 `/graph`의 cites 신호가 통째로 사라진다.
- 폐기할 때는 **먼저 뭐가 바뀌었는지 보고** 되돌린다 — 손수정이 섞여 있으면 같이 날아간다.
  ```bash
  git diff --name-only graphify-out/ src/data/graph.json   # 확인 먼저
  git checkout -- graphify-out/ src/data/graph.json
  ```
  (graphify가 tracked 파일을 덮어쓰므로, 안 되돌리면 다음 `git pull --rebase`가 unstaged 변경으로 막힌다.)
- `--out .`을 빼면 `src/content/posts/graphify-out/`에 써서 **콘텐츠 디렉터리를 오염**시킨다. 항상 붙인다.
- graphify는 `source_file`을 **스캔 루트 기준 상대경로**로 적는다(위 명령이면 `tauri-2.mdx`). `scripts/build-graph-data.ts`의 `toPostSlug`가 이 형태와 예전 레포루트 형태(`src/content/posts/tauri-2.mdx`)를 모두 받는다.
- `scripts/build-graph-data.ts`는 멱등. `graphify-out/`과 `src/data/graph.json`을 함께 커밋한다 — **`cache/semantic/`은 반드시 포함**하고, `cache/ast/`·`cache/stat-index.json`·`manifest.json`·`graph.html`·`logs/`·날짜 백업만 제외한다(`.gitignore`가 이미 그렇게 좁혀져 있으니 넓히지 마라).

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

### Packet captures: VPN 캡처 랩 (별도 레포)

Wire-level 증거가 필요한 글(현재는 **VPN 해부 EP3~EP7**)은 캡처를 **직접 뜨지 않는다.**
실물 패킷 아티팩트가 이미 생성되어 리서치 레포에 있다:

```
~/blog-research/raws/captures/vpn-anatomy-3/   ike_sa_init.txt  ike_auth.txt  ike.pcap
~/blog-research/raws/captures/vpn-anatomy-4/   esp-natt.txt  esp-decrypted.txt  esp.pcap
~/blog-research/raws/captures/vpn-anatomy-5/   wg-handshake.txt  wg-transport.txt  wg-sizes.txt  wg.pcap
~/blog-research/raws/captures/vpn-anatomy-6/   openvpn-opcode.txt  openvpn-tls-auth.txt  openvpn-compare.txt  *.pcap
```

- 각 `.txt` 첫머리 주석에 **생성 명령·패키지 버전·캡처 지점·일시**가 박혀 있다 — 그게 출처 표기다.
- 본문에는 **발췌만**(한 블록 20줄 이내 기준) 넣고, 전문이 필요하면 파일을 가리킨다.
  **디섹션 값은 위조하지 않는다 — 자른다.** 주소·MAC·키는 이미 문서용/합성값이라 가릴 게 없다.
- 크기를 인용할 땐 **계층을 밝힌다**(예: WireGuard 148/92는 UDP 페이로드 길이이지 프레임 길이가 아니다).
- 인용 지침과 편별 매핑은 `~/blog-research/wiki/topics/vpn-capture-lab.md` 와 각 angle 페이지 상단에 있다.

랩 자체는 `~/blog-research/lab/vpn-capture-lab/`(**Lima VM 1개 + network namespace 3개, 컨테이너
런타임 없음**). 새 캡처가 필요할 때만 그쪽 `README.md` 로 간다 — `make vm && make probe && make topo`.
설계 근거는 `raws/010`, 실장 보고(함정·실측값)는 **`raws/011`** 이며 후자가 최신이다.

### Visuals: bbangto-ui-visualization (viz engine) — NOT ChatGPT

All structured visuals (diagrams, charts, infographics, and the hero image) are **implemented directly in code** from the user's design-system package **`@centurio1987/bbangto-ui-visualization`** — the blog does **not** call ChatGPT/OpenAI for images (KAN-013).

- Authors leave a fenced ```` ```viz``` ```` block (JSON: `kind` + `data` + `caption`/`alt`). `make-image`/`image-maker` runs `scripts/apply-viz.ts`:
  - `target:"inline"` (default) → co-located `src/components/posts/<slug>/<Name>.tsx` (wraps a package component in `VizFigure`) + MDX import + `<Name />` — renders as **SSR static SVG, no hydration** (zero-JS paint via the global contract shim `src/styles/viz.css`).
  - `target:"hero"` → `scripts/render-viz.ts` (SSR → Playwright → cwebp/sharp) writes `public/images/<slug>/hero.webp` (also the OG/series-thumbnail raster).
- v1 kinds (`src/lib/viz/schema.ts`, Zod): `ProcessSteps` · `Comparison` · `Flowchart` · `Statistics` · `PosterHero` · `PosterEditorial`. **hero는 `PosterHero`를 쓴다** — 패키지의 `PosterEditorial`은 `title`/`subtitle`/`items`를 줄바꿈도 말줄임도 없이 한 줄 `<text>`로 그려 폭(한글 약 10자)을 넘으면 조용히 잘린다. `PosterHero`(`src/lib/viz/PosterHero.tsx`, 로컬 구현 — `LOCAL_VIZ_KINDS`)는 어절 균형 줄바꿈 + 부제까지 담은 높이 기준 자동 크기 맞춤을 한다. Blog style guide: `src/lib/viz/blogVizStyleGuide.ts` (bound to tokens + `design-concept/DIAGRAM_STYLE_GUIDE.md`).
- **GitHub Packages**: the package lives on `npm.pkg.github.com`. Project `.npmrc` only maps the `@centurio1987` scope → auth comes from your **global `~/.npmrc`** `read:packages` token, so local dev needs **no per-project setup** (`bun install` just works). CI (`main.yml`, `packages: read`) writes the token to `~/.npmrc` before install (`PACKAGES_READ_TOKEN` PAT if set, else the workflow `GITHUB_TOKEN`). Verify inline paint over **`astro preview` (HTTP)**, not `file://`.
- **Legacy (retired)**: `[[[…]]]`(OpenAI), ```figure```(make-image HTML templates), `(( ))`(mdx-concept-diagram) → all replaced by ```viz```. The deprecated stubs `scripts/generate-image.ts` / `render-image.ts` / `image-templates.ts` were removed in KAN-015 (viz engine is the only image path).

- `init-post` — skip the raws→draft pipeline: scaffold a ready-to-write post directly in `src/content/posts/` (draft:true).
- `publish-post` does NOT edit any nav/sidebar config — the collection auto-discovers.

## Notes

- `.obsidian/` (vault config) may exist — do not delete unless asked; the notes vault is separate from the site build.
- Deployment: `.github/workflows/main.yml` (Bun + `astro build` → GitHub Pages on push to `main`).
