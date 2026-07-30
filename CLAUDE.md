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
main 에 글이 착지 (post-merge / post-commit 훅)
  → scripts/graph-autorefresh.sh --check   (게이트: main·staleness·락·산출물 청결)
     → detach → --run → 아래 절차 → verify 통과 시 그래프 경로만 자동 커밋 (push 안 함)

bun run graph:refresh   (= scripts/refresh-graph.sh, main 워크트리 전용 — 수동/부트스트랩용)
  ├ graphify extract src/content/posts/ … --out .  → graphify-out/graph.json          [committed]
  ├ scripts/seed-graph-cache.py                    → graphify-out/cache/semantic/     [committed]
  ├ graphify label . --missing-only --no-viz       → .graphify_labels.json            [committed]
  ├ bun scripts/build-graph-data.ts                → src/data/graph.json (distilled)  [committed]
  └ bun scripts/verify-graph.ts --log …            → 커밋해도 되는지 판정 (비0 = 폐기)
astro build                                        → consumes src/data/graph.json only (no LLM, no key)
```

- **Contract**: CI/`astro build` never runs graphify — it only imports the committed `src/data/graph.json` (via `src/lib/graph.ts`, a glob loader). If the file is missing, the build still passes: related posts degrade to frontmatter-only ranking (series/tags/category, `src/lib/related.ts`) and `/graph` falls back to a plain post list.
- **`/graph` 뷰 규약 (KAN-029)**: 지도에 그려지는 노드는 **글뿐**이다. 개념·키워드 노드는 초기 렌더에 없고, 글 노드에 hover/focus(터치는 첫 탭)했을 때만 그 글의 **연관 키워드 부채**로 펼쳐진다(상위 8개, `degree` 순). 글↔글 엣지는 세 신호를 한 쌍으로 합친 것 — ① 개념 공유(`postPairs.score`) ② 본문 인용(문서 노드 간 직접 엣지, 자기참조 제외) ③ 같은 시리즈의 **이웃 화**(클리크가 아니라 `order` 체인). 그래프에 아직 없는 글은 키워드가 frontmatter `tags`로 degrade 하므로 hover가 빈손이 되지 않는다. 검색은 개념 노드가 사라져도 유지된다(글마다 전체 개념 라벨을 `searchText`로 접어 보냄). 합성·필터링은 `src/pages/graph.astro`, 렌더·인터랙션은 `src/components/graph/GraphExplorer.tsx`.
- **Regeneration은 main 워크트리에서만** (KAN-046, KAN-044 대체). 발행(ship-post)은 그래프를 건드리지 않는다 — 산출물이 커밋 대상이라 병렬 워크트리가 각자 갱신하면 1MB JSON이 다중 충돌하고, 각 워크트리엔 자기 편만 있어 만든 그래프가 형제 편 머지 즉시 stale이 된다. `refresh-graph.sh`가 브랜치·워크트리·graphify 버전을 가드하므로 다른 데서는 실행 자체가 막힌다(`ALLOW_GRAPH_REFRESH_NON_MAIN=1`로만 우회). graphify의 markdown 추출은 LLM 기반이라 CI에는 절대 들어가지 않는다.
- **갱신은 예약제다 — 감지는 에이전트, 실행은 훅 (KAN-056).** `.githooks/post-merge`·`post-commit`이 `scripts/graph-autorefresh.sh --check`를 부르지만, **예약 마커(`graphify-out/.autorefresh/pending`)가 있을 때만** 통과한다. 통과하면 워커를 **detach**해 `refresh-graph.sh`를 완주시킨 뒤 verify 통과 시 `graphify-out/`·`src/data/graph.json`만 자동 커밋하고 예약을 지운다(**push는 안 한다** — 배포는 사람 판단). 클론마다 한 번 `bun run graph:hooks`로 `core.hooksPath`를 연결해야 산다.
  - **왜 예약제인가**: 커밋마다 도는 방식은 예외가 너무 많았다 — 집필 중 커밋·오타 수정·프론트매터 손질까지 전부 갱신을 불렀다. 그래프가 의미 있게 바뀌는 시점은 **시리즈 집필이 끝났을 때**인데, 그건 파일 변화만으로는 판정할 수 없다("EP7이 마지막 편인가"는 판단이다). 판단과 실행을 분리해, 감지는 `bun run graph:request "<사유>"`로 사람/에이전트가 하고 실행은 훅이 맡는다.
  - **감지 책임은 `ship-post`에 있다.** 발행한 글이 시리즈의 마지막 편이면 예약을 남기고 KANBAN `할 일`에 카드를 추가한다. 중간 편이면 예약하지 않는다 — 다음 편에서 함께 반영된다. 판정 근거와 애매할 때의 처리는 `.claude/skills/ship-post/SKILL.md` 1.5절.
  - **왜 훅인가**: 절차 전체에 판단이 0인데 에이전트가 대신 치면 10~40분짜리 로그가 메인 컨텍스트로 통째로 들어오고 세션이 그동안 묶인다. **훅이 줄이는 건 오케스트레이션 비용이지 LLM 비용이 아니다** — `--backend claude-cli` 추출 자체는 여전히 청크마다 `claude -p`를 띄운다(5편 증분 실측 472k in / 108k out). 그 비용을 줄이는 건 시맨틱 캐시다.
  - **게이트(순서대로)**: 끄기 스위치(`GRAPH_AUTOREFRESH_DISABLE=1`) → 재진입(`GRAPH_AUTOREFRESH=1`, 자기 커밋) → main·비링크 워크트리 → **예약 마커** → 도구 존재 → **staleness**(`HEAD:src/content/posts` 트리 해시 vs `graphify-out/.autorefresh/graphed-posts-tree`) → **글 청결** → 같은 입력 실패 마커 → `graphify extract` 실행 중 → 락 → **산출물 청결**. 하나라도 걸리면 **조용히 exit 0** — git을 절대 실패시키지 않는다.
  - **글 청결 가드가 필요한 이유**: graphify는 **워킹트리**를 읽는데 staleness는 HEAD를 본다. 미커밋 글이 있는 채로 돌리면 아직 커밋도 안 된 초고가 그래프에 박히고, 그 그래프는 어느 커밋과도 대응하지 않는다. 집필 중에는 매 커밋마다 조용히 넘어가고 글이 착지해야 돈다.
  - **스탬프는 커밋 전에 미리 찍는다 (`scripts/graph-stamp.sh`).** 손으로 `graph:refresh`를 돌린 뒤 그 글들을 커밋하면 훅이 "스탬프 없음 = stale"로 보고 방금 끝난 갱신을 한 번 더 돈다(캐시 warm이라 LLM은 0이지만 재클러스터링으로 군더더기 커밋이 난다). 그래서 스탬프에는 HEAD 트리가 아니라 **워킹트리 글이 커밋됐을 때 갖게 될 트리 해시**를 적는다 — 임시 인덱스(`GIT_INDEX_FILE`)로 미리 계산하므로 진짜 인덱스는 오염되지 않는다(실측 확인: 예측 해시 == 커밋 후 실제 해시, 스테이징 상태 보존). `graph:refresh`가 끝에서 자동 호출하고, 따로 필요하면 `bun run graph:stamp`.
  - **산출물 청결 가드가 핵심 안전장치다.** 실행 전 `graphify-out/`·`src/data/graph.json`이 깨끗할 때만 돈다. 그래서 나중에 그 경로에 있는 변경은 전부 이번 실행이 만든 것임이 보장되고, CLAUDE.md가 경고하는 "손수정이 같이 날아가는" 사고가 구조적으로 불가능해진다.
  - **실패 시 자동 롤백하지 않는다.** 산출물을 워킹트리에 그대로 남기고 `graphify-out/.autorefresh/status`에 폐기 명령을 적어둔 뒤 알림만 띄운다. 동시에 실패한 글 트리 해시를 `failed-posts-tree`에 적어 **같은 입력으로는 재시도하지 않는다** — 커밋할 때마다 40분짜리 실패를 반복하는 게 최악이기 때문이다. 원인을 고쳤으면 그 파일을 지워 재개한다.
  - **커밋은 `git add -A -- <경로>` + `git commit --only -- <경로>`**다. 사람이 다른 걸 스테이징해 뒀어도 그건 커밋에 들어가지 않고 스테이징 상태로 보존된다(실측 확인). 머지·리베이스 진행 중이면 커밋을 보류하고 알린다. 상태는 `bun run graph:status`.
- **증분 추출의 상태는 `graphify-out/cache/semantic/` 하나다 — 절대 gitignore 하지 마라 (KAN-046).** graphify는 콘텐츠 해시 캐시로 LLM 호출 **전에** 안 바뀐 글을 걸러낸다. 캐시가 없으면 매 실행이 전량 재추출이다(24편 기준 **1.26M in / 280k out / 40~60분**). 실측: 캐시 적중 시 같은 코퍼스가 **34,657 in → 0 토큰**, 그래프는 노드·엣지 수까지 동일.
  - 그런데 graphify 0.9.4는 **이 레포 레이아웃에서 캐시를 스스로 못 쓴다.** `save_semantic_cache()`가 `out_root/<source_file>`이 실재하는지 보는데, `source_file`은 **스캔 루트**(`src/content/posts/`) 기준 상대경로이고 `--out .`은 레포 루트라 경로가 안 맞아 통째로 skip된다. 그래서 `scripts/seed-graph-cache.py`가 추출 직후 `source_file`을 절대경로로 바꿔 graphify **자신의** `save_semantic_cache(root=레포루트)`에 넘겨 심는다(해시 계산은 graphify 함수를 그대로 쓰므로 재구현 없음). 이 단계를 빼면 조용히 예전 비용으로 되돌아간다.
  - **`manifest.json`은 커밋하지 않는다**(gitignore). 같은 종류의 절대/상대 불일치가 `_manifest_files`에도 있어 문서 코퍼스에서는 **항상 `{}`**로 쓰인다. 빈 채로 존재하기만 해도 `incremental_mode`가 켜져 `build_merge` 경로를 타는데, 삭제 감지가 죽어 **지운 글의 노드가 그래프에 영원히 남는다.** 파일이 없으면 매 실행 캐시에서 온전히 재구성돼 삭제가 자연히 반영된다.
  - **`.mdx`는 프론트매터까지 해시된다** (`cache.py`의 프론트매터 스트립은 `.md`에만 적용). 그래서 `post-finalize`의 `tags`·`updatedDate` 갱신도 그 글의 재추출을 유발한다. 본문이 안 바뀌었는데 왜 다시 도나 싶으면 이것이다.
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

### RSS 피드 (KAN-047)

`@astrojs/rss` 기반 정적 피드. 빌드 타임에만 돌고 런타임 의존이 없다.

```
/rss.xml                          전체 피드 (src/pages/rss.xml.ts)
/categories/<slug>/rss.xml        카테고리별 피드 (src/pages/categories/[category]/rss.xml.ts)
src/lib/feed.ts                   채널 메타 · 아이템 조립 · 상한의 단일 소스
```

- **요약 피드다 — 본문 전문을 싣지 않는다.** 글이 MDX라 본문에 React 아일랜드(viz 도식·인터랙티브 시뮬)가 섞여 있는데 리더 안에서는 스크립트가 죽어 껍데기만 남는다. 그래서 아이템에는 **표지(enclosure + `content:encoded` 안의 `<img>`) · 요약(`description`) · 시리즈 회차 · 본문 링크**까지만 담는다. 전문 배급이 필요해지면 Container API 로 렌더한 HTML을 sanitize 해 넣는 확장 지점이 `toFeedItem` 하나뿐이다.
- **회차 표기는 항상 컬렉션 전체를 기준으로 센다.** 카테고리로 거른 부분집합을 `toFeedItem` 에 넘기면 같은 시리즈가 피드마다 다른 편수(`03 / 26` 같은)로 보인다 — `seriesNav.ts` 의 `getSeriesBadge` 주석과 같은 함정이다.
- **`FEED_MAX_ITEMS = 50`.** 리더는 매 폴링마다 피드 전량을 다시 받으므로 상한이 없으면 비용이 발행 수에 비례해 늘어난다. 넘어간 옛 글은 사이트·사이트맵에 그대로 남는다.
- **저자는 `<author>` 가 아니라 `dc:creator`.** RSS 스펙상 `<author>` 는 이메일 주소 자리라 이름을 넣으면 피드 검증기가 문다.
- **`lastBuildDate` 는 최신 글의 `pubDate`** — 빌드 시각을 쓰면 글이 안 바뀐 재배포에도 값이 흔들려 리더가 갱신으로 오인한다. 콘텐츠에서 유도되는 값만 쓴다.
- 글 없는 카테고리도 **빈 피드를 낸다.** 카테고리 페이지는 항상 존재하므로 그 페이지의 구독 링크가 404로 떨어지면 안 된다.
- 노출 지점: 모든 페이지 `<head>` 의 자동발견 링크(전체 피드가 항상 **먼저** — 리더 대부분이 첫 항목을 고른다) · 푸터 `RSS` · 목록/카테고리 페이지 제목 옆 `FeedLink.astro` 캡슐. 카테고리 페이지는 `BaseLayout` 의 `feeds` prop 으로 자기 피드를 하나 더 얹는다.
- 사이트맵은 피드를 싣지 않는다(`@astrojs/sitemap` 이 HTML 페이지만 수집 — 별도 필터 불필요). XSL 스타일시트는 붙이지 않았다 — 브라우저 XSLT 지원이 걷히는 중이라 수명이 짧은 투자다.

### Design

All visual decisions follow `design-concept/DESIGN_CONCEPT.md` and are implemented as CSS variables in `src/styles/tokens.css`. Keep the reading surface calm; wit lives at the edges (hero, footer, 404, hover, the Tony mascot). Hand-drawn motifs are SVG components under `src/components/motifs/`.

**데코 키트** (`design-concept/DECO_KIT.md`) — 마스킹테이프·스티커·두들·포스트잇을 부품(`src/components/deco/`)과 적용 패턴(`.../deco/patterns/`)으로 굳힌 **선택 레이어**. 살아 있는 카탈로그는 `/design/deco`(noindex, 사이트맵 제외).
- **실제 적용처는 세 지면 + 푸터다 (KAN-057)**: 홈(강도 4 — P-02 히어로 콜라주·P-06 섹션 머리·P-07 NEW 도장) · 글 목록(3 — P-06 리본·P-03 필터 클립·P-07 도장) · 글 상세(3 — P-04 인용·P-05 코드·P-08 시리즈 꼬리말) · **푸터 저자 라인업**(W1 걸이줄 + W2 집게 + F1 폴라로이드). 지면별 표와 "안 붙인 곳"의 이유는 `DECO_KIT.md` 7절.
  - **푸터는 저자 컷아웃을 액자에 담아 줄에 매단다 (유저 지시).** `AuthorLineup.astro` 가 그 짜임을 갖고 있다 — 카탈로그의 W3("실 + 집게 조합")은 컴포넌트로 굳히지 않고 레시피로만 남겨 뒀던 것이고, 이 자리가 그게 처음 지면에 앉은 곳이다. 굳힌 판단 넷: ① **매다는 x 는 그리드 열 중심**(저자 n명이면 (i+0.5)/n) — 절대배치 %는 액자 높이(F1 패딩에 딸림)를 손으로 계산해야 하고 flex 는 x 가 칸 폭에 따라 흔들려 ②가 어긋난다. ② **매달리는 높이를 실의 처짐 곡선에서 뽑는다** — 넷을 같은 높이에 걸면 줄은 처져 있는데 사진만 수평이라 줄이 걸이줄이 아니라 밑줄로 읽힌다. 값을 표로 베끼지 않고 `Twine` 의 path 를 그 x 에서 푸는 이유는 저자가 늘거나 줄면 열 중심이 전부 옮겨가서다(베낀 표는 그때 조용히 상한다 — 그래서 **`Twine` 의 path 와 `AuthorLineup` 의 `CURVE` 는 한 쌍이다**). ③ **양 끝은 못 대신 집게로 문다**(`anchors={false}`) — 못과 집게가 한 점에 겹치면 고정 장치가 두 개가 된다. ④ **스윙을 그림에서 액자로 옮겼다** — 액자에 담기는 순간 그건 사진이고, 멈춘 순간이 흔들리면 안 된다. 대신 줄에 걸린 액자가 집게(`transform-origin: top center`)를 축으로 흔들린다. 키프레임(`tony-sway`)은 홈 히어로와 그대로 공유한다.
  - **푸터에서만 `deco.css` 의 opt-in 이 사실상 전역이 된다.** 푸터는 모든 페이지에 있어서 "여기만 지고 간다"가 성립하지 않는다(토큰 + 키프레임 하나, gzip 1KB 미만). 아래 opt-in 규칙의 유일한 예외이고, 그래서 이 컴포넌트에 import 를 두면서 주석으로 못 박았다.
  - 라인업은 **판 폭을 스스로 100% 로 편다.** 푸터 안쪽이 `align-items:center` 인 세로 flex 라 안 주면 shrink-to-fit 으로 줄어드는데(964px 실측에서 624px 이 아니라 408px), 그러면 열 사이 여백이 0 이 되어 액자가 맞닿고 실이 사진 뒤에 가려 한 줄로 걸린 것으로 안 읽힌다.
  - **글 지도(`/graph`)는 되돌렸다가 다시 얹었다 (KAN-058).** KAN-057 이 물렸던 사유(지도 개편이 다른 브랜치에서 도는 중)가 KAN-049·051 착지로 사라져 P-01 판 + M2 `MAP` 탭을 붙였다. 이 지면만 짜임이 다른데, **데코를 얹을 곳이 `client:load` React 아일랜드**라 부품(전부 `.astro`)을 안에 못 넣기 때문이다. 굳힌 판단 여섯:
    - **아일랜드는 구멍만 연다.** `GraphExplorer` 가 svg 를 `.graph-stage`(`position:relative`)로 감싸고 named slot(`slot="deco"` → React `props.deco`) 하나를 열어, 그 구멍이 **지도 상자와 같은 크기의 좌표계**가 된다. 아일랜드는 데코 지식 0 이다(`PostList` 의 `first-deco` 와 같은 짜임). 바깥에서 좌표로 잡는 길은 막혀 있다 — 지도 윗변의 y 가 커맨드 바 토큰 줄바꿈·도움말 토글·후보 칩 줄 수에 따라 움직여 테이프가 상태에 따라 허공에 뜬다.
    - **판은 감싸지 않고 뒤에 깔린다.** 슬롯 HTML 은 이미 렌더된 것이라 React 가 그린 svg 를 감쌀 수 없다. `TapedBoard` 를 `inset:0` 으로 펴 배경으로 두고 지도를 `z-index:1` 로 들어올리면, 종이는 지도 밑 · z 를 스스로 올리는 부품(테이프 z3·탭 z4)은 지도 위로 갈린다. 아일랜드 z 눈금은 `auto 판 → 1 지도 → 2 줌 컨트롤 → 3+ 모서리 부품`. **줌을 2 로 올린 건 지도가 1 로 올라온 결과다** — 둘 다 1 이면 DOM 뒤쪽인 지도가 이겨 버튼이 통째로 덮인다(실측: Playwright 가 "svg intercepts pointer events" 로 클릭을 거부했다).
    - **svg 의 옛 껍데기(배경·1.5px 테두리·radius)를 걷어낸다** — 안 하면 액자가 둘이 되고 불투명 배경이 모눈을 가린다. 아일랜드 CSS 는 React 가 `<style>` 을 그대로 뱉어 scoped 가 아니므로 `graph.astro` 의 `is:global` 을 `.graph-page` 아래로 가둬 덮는다(`posts/index.astro` 선례).
    - **`hover={false}` 는 필수다.** `DecoLayer` 는 갸웃을 받으려고 자식의 `pointer-events` 를 되살리는데 그 되살림이 조상의 `pointer-events:none` 을 **이긴다**. 지도는 드래그 표면이라 테이프가 걸친 띠에서 팬이 죽는다(실측: 판 윗변 8px 아래 hit-test 가 `SPAN.tape` 를 돌려줬다). 테이프 두 장이 P-01 안에 박혀 있어 끌 방법이 없었으므로 **`TapedBoard` 에 `hover` prop 을 팠다**.
    - **판 위 여백 30px.** 테이프가 `top:-14px`·-10° 라 판 밖 24.7px 까지 올라가는데(실측) 후보 패널의 `margin-bottom:12px` 로는 모자란다. **인접 형제 마진은 합쳐지지 않고 큰 쪽으로 상쇄되므로** `.graph-stage` 의 `margin-top` 이 곧 최종 간격이다(12+30 이 아니라 30).
    - **768px 이하 접기는 계산이다.** `--page-pad` 가 `clamp(20px,5vw,48px)` 라 470px 아래에서 여백이 20px 대로 줄어드는데 좌상 테이프는 판 밖으로 ≈23px 나간다 — 두면 가로 스크롤이 생긴다. 판(모눈)은 여백을 안 쓰므로 남는다.
    - **안 얹은 것**: h1 옆 P-06 배지(커맨드 바에 이미 라이브 카운터가 있어 한 화면에 편수가 둘이 된다 — 탭 문구를 `MAP · N편` 이 아니라 `MAP` 으로 둔 이유도 같다) · 시안 1c 의 지도 위 메모+화살표(지도는 팬·줌하므로 **가리키는 데코는 첫 드래그에 거짓말이 된다**) · `corners="diagonal"`(줌 버튼과 우하 테이프가 겹친다) · `tone="cream"`(svg 안 `--surface` 세 곳이 크림 위에서 흰 테두리로 뜬다 — 쓰려면 `--map-paper` 로 먼저 빼야 한다). **이 지면의 규칙은 데코는 액자에만 얹고 내용에는 안 얹는다.**
  - **지도 상자 말고 지면 전체에도 얹었다 (KAN-058 2차).** 1차는 지도 상자 하나만 보고 끝내서 머리·후보 패널·도움말이 **검토조차 안 된 채** 남았다. 지금은 셋 다 얹혀 있고, 나머지 열둘은 **근거를 남기고** 비웠다(`DECO_KIT.md` §7 규칙 7 에 요소별로 적혀 있다 — 안 얹기로 *판단한* 것과 *안 본* 것이 구분되게).
    - **후보 패널은 `/posts` 의 `PostFilter` 와 한 쌍이다** — 같은 역할(필터 판)이라 P-03 `ClippedCard` + 크림 카드(`--cream`)로 처우를 맞췄다. **한쪽만 고치면 한 블로그에 필터 판이 두 얼굴이 된다.** `ClippedCard` 는 감싸는 컴포넌트라 React 가 그린 DOM 을 못 감싸는데, **슬롯을 비운 채 `inset:0` 으로 펴서**(지도 판을 svg 뒤에 깐 것과 같은 수법) 쓴다 — 그래서 클립의 `top`·`rotate`·`tier`·`z` 가 `ClippedCard.astro` **한 곳에만** 남아 드리프트가 구조적으로 불가능하다. 값을 베껴 오면 다음 사람이 그 파일만 고치는 순간 조용히 갈린다.
    - **클립은 모서리에 못 문다** — 이 판의 첫 행은 양 끝이 다 차 있어서(왼쪽 `기간 범위 · 월 단위`, 오른쪽 기간·편수 읽기) 둘 사이 빈 구간(`offset:140px`)에 문다. `/posts` 가 `side="right"` 인 건 그 카드의 오른쪽이 비어서지 오른쪽이 정답이라서가 아니다.
    - **`ClippedCard` 에도 `hover` prop 을 팠다** — `TapedBoard` 와 같은 구멍이었다(§규칙 9). 클립은 카드 밖 위쪽으로 나오므로 그 위에 뭐가 있느냐가 문제가 된다.
    - **도움말은 `helpOpen && …` 가 아니라 `hidden` 으로 여닫는다.** 조건부로 감싸면 SSR 시점(닫힘)에 `<astro-slot>` 이 안 나오고, 하이드레이션은 남아 있는 astro-slot 에서 슬롯을 되찾으므로 그 데코가 클라이언트에 **영영 도착하지 못한다**(열어도 끝까지 빈다). **조건부 위치에 슬롯을 두려면 이걸 기억해라.**
    - **검증은 눈이 아니라 전수 대조다.** `.verify-graph-deco.mjs` 류 스크립트가 **보이는 데코 × 실제 글자 런**(`Range.getClientRects()` — 요소 상자로 재면 폭 100% 인 `<p>` 때문에 거짓 양성이 난다)을 폭마다·상태마다 대조한다. 클립이 라벨을 덮은 것도, 그게 아닌 거짓 양성도 전부 이걸로 갈렸다.
- **카탈로그에 있어도 지면에 없는 부품이 있다** — 생각 풍선 D12(`thought-balloon`), 이름 자리 중 S7·S8(`name-plate`/`name-pill` — 명찰·배지)은 시안 카탈로그에 나중에 들어온 재고라 어느 지면에도 안 붙어 있다(시안도 적용 페이지에 쓰지 않았다). 걸이줄 W1·집게 W2 도 같은 재고였다가 **유저 지시로 푸터에 앉았다**(위). 부품이 늘었다고 지면에 얹지 마라 — 지면마다 강도가 이미 정해져 있다. **재고에서 나온 것들은 전부 "더한" 게 아니라 "갈아 끼운" 것이다**: 낙서 두들 D7~D9 는 콜라주 안에만 살던 임시물(`&hearts;` 글리프 둘 + 별표를 CSS 로 지운 반쪽 D5)을 대신했고, 말풍선 D10·D11 은 손글씨 주석(D6+D3)이 있던 티어 1 을 대신했다(아래). S9 만 순수한 추가인데 그건 유저 지시다.
  - **이름 자리 S9 만 재고에서 나왔다** — 히어로 판 **우하단**에 티어 2 로 앉는다(유저 지시. 위 원칙의 예외라 여기 적는다). 셋 중 S9 을 고른 건 이 판이 "그린 그림"이고 라벨은 거기 **끼운 서식**이라서다 — 오려 붙인 배지(S8)나 인쇄된 명찰(S7)은 격이 안 맞는다. 머리띠 활자는 기본값 `FROM` 이 아니라 `NAME` 이다(적는 이름이 보낸 사람이 아니라 그림의 주인공이다). **자리는 코너 테이프와의 다툼이 정했다**(`DECO_KIT.md` 5절 규칙 8): 우하단 테이프가 `bottom:-3%`·32px 인데 -6° 로 기울어 겹치는 x 구간에서 윗변이 판 밑 ≈31px 까지 올라오므로, 라벨 `bottom` 은 11%(964px 기준 ≈46px)다. 마스코트와는 일부러 겹친다(z 를 마스코트 위로) — 그림 위에 붙인 명찰로 읽혀야 한다. 이름 문구는 `HeroCollage` 의 `name` prop 이고 빈 문자열이면 라벨이 빠진다.
  - **홈 히어로의 티어 1 은 말풍선이다 (유저 지시)** — 원래 손글씨 주석 ×2(D6 메모 + D3 화살표)였는데 D10(민트 말풍선, 왼쪽)·D11(핑크 폭발 풍선, 오른쪽)으로 바꿨다. 뜻이 갈린다: 손글씨+화살표는 여백에 끄적여 마스코트를 **가리키는** 주석이고, 풍선은 마스코트가 **말하는** 것이다. **화살표는 함께 뺐다** — 꼬리가 같은 일(가리키기)을 하므로 둘 다 두면 한 말에 손가락이 두 개 붙는다. 왼쪽은 `flip` 으로 꼬리를 마스코트 쪽으로 돌리고, 기울기는 시안의 풍선 각도(-3°·4°)를 쓴다(예전 주석의 -7°/6° 를 물려받으면 덩치 큰 풍선이 삐뚤어 보인다). 폭 116·104 는 자연 크기보다 죈 값인데, 티어 1 은 좁은 화면에서도 남는 층이라 실루엣과 안 부딪혀야 해서다.
- **풍선 두들(D10~D12)의 글씨 크기·자리는 시안 값이 아니라 실측값이다.** 시안 글씨는 Nanum Pen Script 인데 이 레포는 `--font-hand`(Gaegu)로 환산하므로(≈0.88배) 줄 상자가 짧아지고, `top` 을 시안대로 두면 글씨가 풍선 안에서 위로 올라붙는다. 풍선 높이를 100 으로 본 글씨 잉크 중심을 시안(42.3·48.0·44.2)에 맞춰 `top` 을 6→9·28→31·19→21 로 고쳤다(현재 42.2·47.5·49.8 — D11 만 시안 값에서 벗어나는데, 별을 판 한가운데로 옮겨 그 중심이 44.2%→50% 로 갔기 때문이다. 아래). 숫자를 만질 땐 다시 재라 — 근거와 재는 방법은 `Doodle.astro` 의 `BALLOON` 표 주석.
  - **가로(`left`·`tw`·`fs`)는 viewBox 가 아니라 그림의 속을 재서 넣는다 — D11 이 이걸 어겨 글씨가 별 가시를 뚫고 나갔다.** 둘이 겹쳤다: 열두 뿔 별이 viewBox 안에서 오른쪽으로 치우쳐 있었고(길의 x 범위 23~106 → 속의 중심 64.6 인데 `left:0`+`tw:118` 은 viewBox 중심 59 에 놓는다), 별의 **속**은 껍데기보다 훨씬 좁다(글씨 밴드에서 48.75). 사각 풍선 D10 의 `tw:118` 을 그대로 물려받은 값이라 애초에 두 글자짜리 크기였는데 "빵-하!"는 `fs:23` 에서 63.0 이었다 — 왼쪽으로 12.8 삐져나왔다.
  - **고친 건 표가 아니라 별이다 — 그런데 모양은 안 건드렸다.** 표만 고치면(속을 재서 `left:40.5`·`tw:49`) `fs` 를 17 까지 내려야 해서 민트 D10(20.3px)과 짝이 안 맞는다. 대신 별을 뜯어보니 **자기 판 안에서 떠 있었다** — 118×92 판에 83×74 로 앉아 왼쪽 23·아래 14 의 시안 아트보드 여백을 이고 있었다. 그 여백을 별에 돌려주니(중심 기준 이방 확대 x1.33·y1.14 + 중심을 판 한가운데로) 속이 48.75→66.5 가 되어 `fs:23`·`left:0`·`tw:118`·`top:32.8` 로 되돌아왔다(좌우 여유 1.7·1.8). **부품의 배치 상자는 1px 도 안 바뀌었다** — 판을 채웠을 뿐이라 히어로 좌표를 손댈 필요가 없었다.
  - **모양을 안 건드려도 됐던 건 별이 손그림이 아니었기 때문이다.** 시안 길은 완전한 점대칭(반사 오차 0.0)에 뿔 12개가 타원(rx 42.3·ry 37.6), 패임 12개가 동심 타원(31.0·27.7, 깊이 26.5%) 위에 놓인 구성물이고, 꼭짓점이 그 타원에서 벗어난 폭은 ±0.9 뿐이다 — **손맛은 기하가 아니라 CrayonFilters 가 낸다.** 그래서 각도·대칭·±0.9·패임 깊이를 그대로 두고 반지름만 늘리면 같은 그림이 된다. 크레용 결은 필터가 user space 라 안 커지는데 그게 옳다 — 크레용 결은 크레용의 성질이지 그림 크기의 성질이 아니다.
  - **패임을 얕게 파는 걸로는 못 고친다.** `fs:23` 을 담으려면 안쪽 타원이 rx 44 는 되어야 하는데 옛 바깥 반지름 42.3 으로는 깊이가 0 이어도(=별이 아니라 원) 못 미친다. 풍선을 키우는 것도 답이 아니다 — 들어가느냐는 `width` 와 무관한 **비율** 문제라(글씨도 `k` 로 같이 커진다) 그대로 넘친다. 판을 채우는 게 유일한 공짜 여백이었다.
  - **재는 건 눈이 아니라 hit-test 다.** 회전 없는 자리에 풍선을 복제해 놓고, 잉크 외곽선 path 를 `stroke-width + 3.4` 로 부풀린 사본에 대고 `isPointInStroke`·`isPointInFill` 로 글씨 상자 둘레를 찍는다. 3.4 는 `ink` 필터의 `feDisplacementMap scale` 이 선을 ±1.7 흔들기 때문이고, 세로는 글자별 실제 잉크가 아니라 폰트 전체 밴드로 잡는다 — 부품이 아무 `text` 나 받으므로 받침 깊은 글자가 와도 안 넘쳐야 한다. **`flip` 은 그림만 뒤집고 글씨는 세워 두되, 글씨의 자리·기울기는 같이 뒤집어야 한다**(`w - left - tw`, 기울기 부호 반전) — 풍선 몸통이 좌우 대칭이 아니라서 그림만 뒤집으면 글씨가 몸통 중심에서 밀린다(실측: D10 을 flip 하고 `left` 를 그대로 두면 글씨 잉크가 폭의 15.2%~79.4% 로 왼쪽에 붙는다).
- 토큰·강도·모션은 `src/styles/deco.css` 이고 **전역이 아니라 쓰는 쪽에서 import** 한다 — 데코는 고른 지점에만 얹는 장식이라 전 페이지가 지고 갈 이유가 없다(예외는 푸터 하나뿐 — 위). 그래서 `PostList` 는 데코 부품을 스스로 들이지 않고 첫 항목용 named slot(`first-deco`)만 연다 — 그 컴포넌트는 데코를 안 쓰는 `/categories/*`·`/graph` 에서도 쓰이기 때문이다.
- **글 상세의 인용·코드는 MDX `components` 매핑으로 치환된다** (`src/pages/posts/[...slug].astro` → `src/components/deco/mdx/`). 본문 파일을 안 고치고 데코를 얹는 유일한 접점이라 그렇고, 어댑터는 Shiki 가 `pre` 에 심은 속성을 그대로 되돌려줘야 한다(안 하면 하이라이팅이 죽는다). 폭신 대담(`template: "talk"`)은 자기 시각 언어가 있고 `deco.css` 를 안 들여오므로 제외한다.
- **되풀이되는 요소엔 테이프를 첫 하나에만** 남긴다(`PostLayout` 의 `.taped-quote ~ .taped-quote` 전역 규칙). 인용 11개·코드블록 42개짜리 글이 있어서, 전부 붙이면 테이프가 인용·코드의 기본 장식으로 읽힌다 — 도장을 한 항목에만 찍는 이유와 같다.
- 시안 팔레트·폰트는 종이·테이프·스티커에 한해 **코어 토큰으로 환산**해 들여왔다(짝 없는 색만 `--deco-*` 로 신설 — 핑크·레드, 걸이줄·집게의 크라프트·금속). 시안 hex 를 통째로 쓰면 팔레트가 두 벌이 되고, Nanum Pen 을 들이면 한국어 웹폰트가 6종이 된다. **두들의 크레용 색만 시안 hex 그대로다**(`--deco-crayon-*`) — `color-mix` 로 코어에 환산했다가 되돌렸다. 크레용은 맑은 색을 눌러 칠한 것이라 한 단 어둡고 탁해지면 크레용이 아니라 물감 바른 벡터 도형으로 읽히고, 두들 말고는 이 색을 아무도 안 써서 팔레트가 갈리지도 않는다.
- **두들의 손맛은 `feTurbulence` 넷이 만든다** (`src/components/deco/CrayonFilters.astro`, 시안 정의 그대로 — 칠은 `crayon`/`crayon-dense`, 두른 선은 `ink`, 가는 펜 D3~D6 은 `ink-fine`). 처음엔 "래스터를 다시 굽는 비용"이라며 넷을 다 뺐는데 **틀린 판단이라 되돌렸다** — 인라인 SVG 필터엔 굽는 단계가 없고, 필터가 없으면 기하가 같아도 크레용이 매끈한 벡터 아이콘이 된다(실제로 시안과 딴 그림이 나왔다). 함정 둘: 필터 id 는 인스턴스마다 유일하고 **정의가 부품 안에 함께 실린다**(SVG `filter` 속성이 없는 id 를 가리키면 그 요소는 조용히 무시되는 게 아니라 **아예 안 그려진다**), 그리고 `scale` 은 걸리는 요소의 좌표계 단위라 **D1·D2 는 시안대로 HTML + CSS filter 로 둔다**(SVG viewBox 로 옮기면 결이 3배 잘게 갈려 매끈해진다). 자세한 건 `DECO_KIT.md` D 절.
- 장식 총량은 `data-deco="1"~"5"` 하나로 접힌다(부품마다 티어 1~4). 페이지마다 꾸밈 정도가 갈리는데 그때마다 마크업을 고치면 되돌리기 어렵기 때문이다.
- **부모 scoped CSS 로 부품을 못 고친다** — Astro 는 자식 컴포넌트 루트에 자식의 `data-astro-cid` 만 붙여서 `class` 를 넘겨도 부모 선택자가 매칭되지 않는다. prop 이나 지역 조상 아래 `:global()` 을 쓴다.
- 마스코트 다이컷(`public/images/deco/tony-diecut.webp`)과 저자 아바타(`tony-full.webp`)는 **장식 없는 마스터 렌더**(`design-concept/authors/tony-fullbody-master.webp`, 배포 안 함)에서 `extract-author-cutout.ts` 의 (D) 경로로 오려낸다 — 구운 합성물 `public/tony-deco.webp` 는 **오른 다리가 메모 종이에 가려져** 온전한 실루엣이 존재하지 않는다. 인자(`--bg-tol`·`--shadow-floor`·`--rim`)는 **눈대중이 아니라 측정값**이고 근거와 재생성 명령은 `DECO_KIT.md` 8절 — 배경 허용 오차를 재지 않고 넓히면 흰 털(귀·볼·배)이 배경으로 넘어가 갉히고, 접지 그림자를 채도로만 자르면 다리 털 림이 같이 깎인다(옅게 얹힌 털과 그림자는 색이 같아서 **기하로만** 갈린다). 다시 오리면 크롭 폭이 바뀌므로 비율은 `src/lib/deco.ts` 의 `tonyDiecutHeight()` 하나로 모아 쓴다. 흰 테두리는 파일에 없고 `.deco-diecut` 유틸이 CSS 로 그린다.

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
- v1 kinds (`src/lib/viz/schema.ts`, Zod): `ProcessSteps` · `Comparison` · `Flowchart` · `Statistics` · `PosterHero` · `PosterEditorial`. Blog style guide: `src/lib/viz/blogVizStyleGuide.ts` (bound to tokens + `design-concept/DIAGRAM_STYLE_GUIDE.md`).
- **텍스트 넘침이 이 엔진의 고질병이다 — 셋을 로컬 구현으로 대체했다 (KAN-016 → 재발).** SVG `<text>` 는 리플로도 클리핑도 안 해서, 상자보다 긴 라벨이 **에러 없이** 밖으로 흘러 viewBox 경계에서 잘린다(빌드·타입 모두 초록). 패키지 컴포넌트는 라벨을 **줄바꿈 없는 단일 `<text>`** 로 그리고, 패키지의 `estimateWidth` 는 글자 종류와 무관하게 `0.55 × fontSize` 라 **전각인 한글을 약 45% 과소평가**한다 — 그래서 패키지의 `wrapText` 를 써도 한글은 넘치고 "안 잘린다"는 판정 자체가 틀린다.
  - `LOCAL_VIZ_KINDS`(`src/lib/viz/<kind>.tsx`) = **`PosterHero` · `Comparison` · `ProcessSteps`**. 셋 다 `src/lib/viz/text.ts` 의 전각 기준으로 어절 균형 줄바꿈을 하고, **높이를 콘텐츠에서 되뽑는다**(저작 viewBox 는 **폭만** 계약이고 높이는 무시 — 그래서 넘치지도, 빈 여백이 남지도 않는다). `Comparison` 은 판의 배치 계산과 렌더가 같은 함수를 쓴다(따로 어림하면 둘이 어긋나 빈 띠나 뚫림이 생긴다).
  - **hero 는 `PosterHero`를 쓴다** — 패키지의 `PosterEditorial`은 `title`/`subtitle`/`items`를 한 줄 `<text>`로 그려 폭(한글 약 10자)을 넘으면 조용히 잘린다.
  - `Comparison` 의 `mode:"magnitude"` 와 `ProcessSteps` 의 horizontal·zigzag 은 이 블로그가 안 쓰거나(전자는 상자가 없어 넘칠 대상이 없다) 패키지 구현에 위임한다.
  - **재발 방지는 권고가 아니라 `bun run viz:verify` 다** (`scripts/verify-viz.ts`). 실제 렌더에서 모든 `<text>` 를 담는 상자·viewBox 와 재서 넘치면 비0으로 끝난다. IMAGE_GUIDE 의 "텍스트는 짧게"(권고) + "눈으로 봐라"(사람)는 두 번 다 놓쳤다. 배경은 `.claude/skills/make-image/assets/IMAGE_GUIDE.md` R6.
  - `render-viz.ts` 의 `#capture` 는 **폭만 고정한다**(`height:auto`). 높이를 저작 viewBox 로 가두면 콘텐츠 기준 높이를 쓰는 kind 가 letterbox 된다. hero(`PosterHero`)는 viewBox 가 고정이라 래스터는 그대로 1200×676(OG 규격)이다.
- **GitHub Packages**: the package lives on `npm.pkg.github.com`. Project `.npmrc` only maps the `@centurio1987` scope → auth comes from your **global `~/.npmrc`** `read:packages` token, so local dev needs **no per-project setup** (`bun install` just works). CI (`main.yml`, `packages: read`) writes the token to `~/.npmrc` before install (`PACKAGES_READ_TOKEN` PAT if set, else the workflow `GITHUB_TOKEN`). Verify inline paint over **`astro preview` (HTTP)**, not `file://`.
- **Legacy (retired)**: `[[[…]]]`(OpenAI), ```figure```(make-image HTML templates), `(( ))`(mdx-concept-diagram) → all replaced by ```viz```. The deprecated stubs `scripts/generate-image.ts` / `render-image.ts` / `image-templates.ts` were removed in KAN-015 (viz engine is the only image path).

- `init-post` — skip the raws→draft pipeline: scaffold a ready-to-write post directly in `src/content/posts/` (draft:true).
- `publish-post` does NOT edit any nav/sidebar config — the collection auto-discovers.

## Notes

- `.obsidian/` (vault config) may exist — do not delete unless asked; the notes vault is separate from the site build.
- Deployment: `.github/workflows/main.yml` (Bun + `astro build` → GitHub Pages on push to `main`).
