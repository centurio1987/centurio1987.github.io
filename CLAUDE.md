# CLAUDE.md

This file provides guidance to Claude when working with code in this repository.

## What this is

A writing-focused personal blog (빵관 토니 — "Serious Work, Joyful Wit"), built with **Astro** and deployed to GitHub Pages. Resume/portfolio/value sections were removed; the site exists to publish posts. Design language is defined in `design-concept/DESIGN_CONCEPT.md` (v0.2: light, earthy palette, all sans-serif, hand-drawn motifs).

## Commands

CI uses **Bun**; locally either works. Standard Astro scripts (`dev`/`build`/`preview`) plus
repo-specific ones (`viz:verify`·`deco:verify`·`graph:*`·`gen:motion`) — see `package.json`.

No test suite. Verify by building (`build`) and previewing.

## Architecture

Astro static site. Source lives entirely under `src/`; `public/` is served at the site root.

Non-obvious bits the layout alone won't tell you: `src/lib/categories.ts` (8 category slugs)
and `src/lib/authors.ts` (author registry) are **single sources of truth** — don't duplicate
their contents anywhere. `/raws/` holds USER-authored idea fragments (input to the writing
workflow below), `/draft/` holds pre-publish work, and `/public/images/<slug>/` holds
generated post images.

### Content model

Posts are markdown in `src/content/posts/`. Frontmatter schema lives in `src/content.config.ts`
(Zod) — read it there rather than trusting a copy.

**Authors**: `tony` (빵관 토니, 사람) · `ppangto` (빵토 연구원, AI 완전 집필). Author appears in post meta, post lists, and as a profile card (`AuthorProfile.astro`) at the bottom of every post.

**저자 그림은 마스터 하나에서 두 벌로 굽는다** — 원본은 전부 `design-concept/authors/`(배포 안 함)에 있고, `public/images/authors/`엔 구운 결과물만 남는다. 얼굴 샷 `<id>.webp`(프로필 카드 104px 원 · 목록 22px)는 `scripts/make-author-face.ts`, 전신 컷아웃 `<id>-full.webp`(푸터 라인업)는 `scripts/extract-author-cutout.ts`가 만든다. 셋 다 **배경을 오려낸 투명 webp**라 어느 지면의 종이색 위에도 그대로 앉는다(`.ap-avatar`가 `--paper`를 깐다) — 마스터마다 배경이 크림/흰색/투명으로 갈리는데 그걸 그대로 두면 원 네 개의 바탕색이 미묘하게 어긋난다. **전신샷을 아바타로 돌려 쓰지 마라**(원 안에서 얼굴이 20px로 줄어 누가 누군지 안 보인다). 얼굴 크롭 자리 네 개가 `make-author-face.ts`의 표 하나에 모여 있는 이유는 한 명만 따로 자르면 목록에서 얼굴 크기가 제각각이 되기 때문이고, `bgTol`은 눈대중이 아니라 마스터마다 잰 값이다(흰 볼털 하이라이트가 흰 배경과 같은 255까지 올라가서 넓히면 fill이 볼을 뚫는다 — `extract-author-cutout.ts` (D) 절과 같은 함정). 얼굴 샷을 다시 구우면 **`make-author-avatars.ts`로 64px 사본까지** 다시 굽는다. 근거와 재생성 명령은 `DECO_KIT.md` 8절. If the author has `isAI: true`, an AI banner (`AiBanner.astro`, image at `public/images/authors/ai-banner.webp`) renders at the top of the post — AI가 완전 집필한 글은 frontmatter에 `author: ppangto`만 지정하면 된다.

**Series patterns** (모든 포스트에 자동 적용, `src/lib/seriesNav.ts`가 단일 소스):
- `PostNav.astro` — 이전화/다음화 카드. 시리즈 글은 `order` 기준 EP 네비게이션, 그 외는 발행일 기준.
- `SeriesEpisodes.astro` — "지난 에피소드" 카드 그리드. 같은 `series` 글이 2개 이상일 때 렌더링, 현재 화 하이라이트, 썸네일은 `/images/<slug>/hero.webp` (없으면 해칭).

**폭신 대담 (인터뷰 시리즈)**: frontmatter `template: "talk"`로 활성화되는 인터뷰 레이아웃 (`TalkLayout.astro`). 구성: 대담 배너(`public/images/talk/banner.webp`, 없으면 생략) → 시리즈·EP 헤더 → 화자 듀오(글쓴이 × 빵토 교수님) → 오늘의 질문 목차(QA에서 자동 생성) → Q&A 본문 → 태그 → PostNav/SeriesEpisodes/AuthorProfile/RelatedPosts. 본문은 MDX 컴포넌트 `<QA n q>`·`<PullQuote>` (`src/components/talk/`)로 쓴다. 화자·배너 설정은 `src/lib/talk.ts`. 에피소드 템플릿은 자산으로 `src/templates/talk-episode.mdx`에 관리한다 — 새 에피소드는 `init-post --talk`가 이 템플릿을 `src/content/posts/`로 복사해 스캐폴드한다.

`category` must be one of the slugs in `src/lib/categories.ts`.

Posts are **auto-discovered** — no sidebar/nav registration needed. A post's URL is `/posts/<file-slug>`; categories list at `/categories/<slug>`. `draft: true` hides a post from listings.

### Graph data (연관 글 · /graph 글 지도)

연관 글 섹션과 `/graph` 탐색기는 graphify 지식그래프가 떠받친다. 파이프라인 전체 절차·근거·
실측값·함정은 **`graph-pipeline` 스킬**에 있다 — 그래프를 재생성하거나 자동 갱신 훅·증분 캐시·
검증·`/graph` 뷰 규약을 손보기 전에 반드시 그 스킬을 읽어라. 아래는 어겨서는 안 되는 것만 남긴 것이다.

- **Contract**: CI/`astro build` never runs graphify — it only imports the committed
  `src/data/graph.json` (via `src/lib/graph.ts`). 파일이 없어도 빌드는 통과한다: 연관 글은
  frontmatter 기준(`src/lib/related.ts`)으로, `/graph`는 평범한 글 목록으로 degrade 한다.
  graphify 의 markdown 추출은 LLM 기반이라 **CI에는 절대 들어가지 않는다.**
- **재생성은 main 워크트리에서만** (KAN-046). 발행(ship-post)은 그래프를 건드리지 않는다.
  `refresh-graph.sh`가 브랜치·워크트리를 가드한다(`ALLOW_GRAPH_REFRESH_NON_MAIN=1`로만 우회).
- **`graphify-out/cache/semantic/` 를 절대 gitignore 하지 마라.** 증분 추출의 상태가 여기 하나뿐이다.
  지우면 매 실행이 전량 재추출(24편 기준 1.26M in / 40~60분)로 조용히 되돌아간다.
- **`manifest.json` 은 커밋하지 않는다.** 빈 채로 존재하기만 해도 삭제 감지가 죽어 **지운 글의
  노드가 그래프에 영원히 남는다.**
- **`--out .` 을 항상 붙인다.** 빼면 `src/content/posts/` 안에 써서 콘텐츠 디렉터리를 오염시킨다.
- **검증은 `bun run graph:verify` 하나로 한다.** 손으로 세지 말 것 — 비0으로 끝나면 그 graph.json은 버린다.
- 폐기할 때는 **먼저 뭐가 바뀌었는지 보고** 되돌린다 — 손수정이 섞여 있으면 같이 날아간다.
  ```bash
  git diff --name-only graphify-out/ src/data/graph.json   # 확인 먼저
  git checkout -- graphify-out/ src/data/graph.json
  ```

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

All visual decisions follow `design-concept/DESIGN_CONCEPT.md` and are implemented as CSS
variables in `src/styles/tokens.css`. Keep the reading surface calm; wit lives at the edges
(hero, footer, 404, hover, the Tony mascot). Hand-drawn motifs are SVG components under
`src/components/motifs/`.

**데코 키트** — 마스킹테이프·스티커·두들·포스트잇을 부품(`src/components/deco/`)과 적용 패턴으로
굳힌 **선택 레이어**. 부품 목록·지면별 강도·굳힌 판단·실측 좌표는 **`deco-kit` 스킬**에 있다 —
데코를 얹거나 떼거나 고치기 전에 반드시 그 스킬을 읽어라. 살아 있는 카탈로그는 `/design/deco`
(noindex, 사이트맵 제외), 깊은 레퍼런스는 `design-concept/DECO_KIT.md`. 아래만 기억하면 된다.

- **적용처는 정해져 있다** — 홈·글 목록·글 상세·글 지도, 그리고 푸터 저자 라인업. 부품이
  늘었다고 지면에 얹지 마라: 지면마다 강도가 이미 정해져 있고, "안 붙인 곳"에는 근거가 있다.
- **`src/styles/deco.css` 는 전역이 아니라 쓰는 쪽에서 import 한다** — 데코는 고른 지점에만
  얹는 장식이라 전 페이지가 지고 갈 이유가 없다. 유일한 예외는 푸터(모든 페이지에 있다).
- **좌표·크기·글씨 자리는 눈대중이 아니라 실측값이다.** 근거 없이 바꾸면 조용히 깨진다.
  검증은 눈이 아니라 `bun run deco:verify`.
- **부모 scoped CSS 로 부품을 못 고친다** — Astro 는 자식 컴포넌트 루트에 자식의
  `data-astro-cid` 만 붙인다. prop 이나 지역 조상 아래 `:global()` 을 쓴다.
- 폭신 대담(`template: "talk"`)은 자기 시각 언어가 있고 `deco.css` 를 안 들여오므로 제외한다.

### 이미지 로딩 (KAN-059)

첫 화면 그림이 텍스트보다 늦게 떠서 "데코는 다 그려졌는데 주인공만 없는" 화면이 뜨던 문제.
**폰트와의 회선 다툼**이 원인이었다 — 한국어 웹폰트 3종의 서브셋 30여 개(~530KB)가 VeryHigh 로
회선을 물고, 이미지는 그 뒤에 줄을 섰다. 개선 후 실측(Slow 3G · CPU 4×): LCP 7.3s → 3.3s,
마스코트가 **첫 페인트에 포함**된다. 셋만 지키면 된다.

- **첫 화면 큰 그림은 `BaseLayout` 의 `preloadImages` 로 넘긴다. 딱 하나, LCP 후보만.**
  이 `<link rel=preload>` 는 반드시 폰트 스타일시트 **위**에 놓인다 — 순서가 곧 전부다.
  여럿 넣으면 서로 대역을 나눠 가져 아무것도 안 빨라진다.
- **화면 안 그림에 `loading="lazy"` 를 붙이지 마라.** 지연 로드가 안 걸릴뿐더러 브라우저가
  우선순위까지 낮춘다(헤더 로고가 그래서 Low 로 깔려 FCP 뒤에 도착했다 → `fetchpriority="high"`).
- **`[data-imgwait]`(그림 올 때까지 판을 비워 두는 표식)을 LCP 요소에 걸지 마라.** 보이는
  시점이 JS 이벤트에 묶여 LCP 가 메인스레드 사정에 끌려다닌다 — 히어로에 걸었다가 같은
  빌드에서 1032·1748·2760ms 가 나와 되돌렸다. **화면 밖 그림에만** 값이 있다(현재 푸터 저자
  라인업 하나). 계약·안전 원칙은 `src/styles/motion.css` 의 "이미지 도착 대기" 절.

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
