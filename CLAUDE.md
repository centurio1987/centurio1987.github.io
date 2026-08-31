# CLAUDE.md

This file provides guidance to Claude when working with code in this repository.

## What this is

A writing-focused personal blog (빵관 토니 — "Serious Work, Joyful Wit"), built with **Astro** and deployed to GitHub Pages. Resume/portfolio/value sections were removed; the site exists to publish posts. Design language is defined in `design-concept/DESIGN_CONCEPT.md` (v0.2: light, earthy palette, all sans-serif, hand-drawn motifs).

## Commands

CI uses **Bun**; locally either works. Standard Astro scripts (`dev`/`build`/`preview`) plus
repo-specific ones (`viz:verify`·`deco:verify`·`tokens:verify`·`graph:*`·`gen:motion`) — see `package.json`.

No test suite. Verify by building (`build`) and previewing.

**게이트를 새로 만들 때의 모양 (KAN-070).** 이 레포의 게이트는 전부 같은 규약을 진다 —
`#!/usr/bin/env bun` 셰뱅 · 머리주석이 **"왜 필요한가"부터**(빌드도 타입도 초록이라 눈 말고는
안 잡힌다는 그 이유) · `failures[]`/`notes[]` 분리 · `console.error("고치는 법: …")` ·
`process.exit(1)`. 파일 수는 규약이 아니다:

- **판정 축이 하나면 단일 파일**이다 — `verify-viz`·`verify-deco`·`verify-widths`·
  `verify-talk`·`verify-graph` 다섯이 그렇다.
- **축이 여럿이면 진입점 하나 + `scripts/lib/<게이트명>/` 의 축 모듈**이다.
  **규약은 전부 진입점이 지고 축 모듈은 판정만 돌려준다.** `verify-tokens` 가 그 첫 사례다
  (색·fallback·문서 규칙 셋을 병렬로 저작했고, 자가검사·베이스라인·예외 표가 축과 독립된
  관심사라 한 파일에 섞으면 읽는 사람이 매번 축과 인프라를 갈라내야 한다).
- **게이트는 자기를 검사한다.** 고장을 일부러 주입해 잡히는지 보는 자가검사를 함께 둔다
  (`verify-talk` 의 `selfTestFaults()`, `verify-tokens` 의 `scripts/lib/tokens/selftest.ts`).
  래칫형 게이트에서는 필수다 — 게이트가 조용히 죽으면 "줄었다"로 읽혀 통과한다.

## Architecture

Astro static site. Source lives entirely under `src/`; `public/` is served at the site root.

Non-obvious bits the layout alone won't tell you: `src/lib/categories.ts` (9 category slugs)
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

**대화 원본에서 만드는 에피소드는 발행물을 직접 쓰지 않는다 — 세 층을 거쳐 굽는다 (KAN-066).**
빈 스켈레톤을 채우는 `init-post --talk` 와 달리, AI 대화 export 가 입력일 때는 `talk-ingest`
스킬이 맡는다. 층은 셋이고 **아래로만 흐른다.**

```
L1 원문   raws/talks/<slug>/source/ + source.json   받은 그대로. 아무도 안 고친다
L2 정형본 raws/talks/<slug>/talk.md                 사람이 계속 손보는 정본
L3 발행물 src/content/posts/talk-<slug>.mdx         파생물. 손으로 고치지 않는다
```

절차·규격·굳힌 판단은 **`talk-ingest` 스킬**과 `raws/talks/README.md`·`_rules/`(정규화 규칙 ·
`talk.md` 문법)에 있다 — 대담 입력 경로를 손대기 전에 읽어라. 아래만 기억하면 된다.

- **L3 를 손으로 고치지 마라.** 고칠 것이 있으면 L2 를 고치고 `bun run talk:build <slug>` 로
  다시 굽는다. 발행물을 고치면 다음 굽기에서 그 수정이 조용히 사라지고, "원문이 있으니 언제든
  다시 만든다"가 거짓이 된다. 어긋남은 눈이 아니라 `bun run talk:verify` 가 잡는다.
- **`template: talk` 을 `talk.md` 에 쓰지 않는다** — 빌더가 박는다. 두 곳이 값을 들면 다툰다.
  같은 이유로 **질문 번호도 쓰지 않는다**(`## Q. <질문문>` 만 쓰면 순서에서 나온다).
- **`source/` 안은 불변이다.** sha256 이 `source.json` 에 박혀 있어 한 바이트만 움직여도 굽기가 거부된다.
- **잘린 원본(`<truncated N bytes>`)은 정본이 못 된다.** L1 봉인만 하고 L2 를 만들지 않는다 —
  실측 사례가 있다(`raws/talks/ddd-entry-contradiction`: 답변 5개, 26.8% 유실).
- **민감 패턴이 발화에 있으면 봉인 자체를 안 한다.** `raws/` 는 공개 저장소에 커밋된다.
- 검증용 픽스처는 `scripts/fixtures/talk/` 에 둔다 — `raws/talks/` 에 두면 그게 곧 발행 글이 된다.

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

`@astrojs/rss` 기반 정적 피드(`/rss.xml` 전체 · `/categories/<slug>/rss.xml` 카테고리별).
빌드 타임에만 돌고 런타임 의존이 없다. **`src/lib/feed.ts` 가 채널 메타·아이템 조립·상한의 단일 소스다.**

절차·굳힌 판단(요약 피드인 이유, 회차 계산 기준, `FEED_MAX_ITEMS`, `dc:creator`, `lastBuildDate`,
노출 지점)은 **`rss-feeds` 스킬**에 있다 — 피드를 고치기 전에 반드시 읽어라. 아래만 기억하면 된다.

- **요약 피드다 — 본문 전문을 싣지 않는다.** 본문이 MDX라 React 아일랜드가 섞여 있어 리더 안에서는 껍데기만 남는다.
- **회차 표기는 항상 컬렉션 전체를 기준으로 센다.** 카테고리로 거른 부분집합을 넘기면 같은 시리즈가 피드마다 다른 편수로 보인다.

### Design

All visual decisions follow `design-concept/DESIGN_CONCEPT.md` and are implemented as CSS
variables in `src/styles/tokens.css`. Keep the reading surface calm; wit lives at the edges
(hero, footer, 404, hover, the Tony mascot). Hand-drawn motifs are SVG components under
`src/components/motifs/`.

**시각 값은 토큰을 쓴다 — 게이트가 문다(KAN-070).** 토큰 밖 색·간격·radius·선 굵기는
**빌드도 타입도 초록이라 눈 말고는 안 잡힌다.** 실제로 전수 진단에서 `src/**` 152파일
3,539 히트 중 위반이 1,304건 나왔고(준수율 47.9%), 무너진 구획 둘이 발행 글의 부품이었다 —
글 안 React 시뮬 3.6% · 손그림 모티프 8.1%. 진단 정본은
`design-concept/UI_CONSISTENCY_AUDIT.md` 이고, 게이트는 `bun run tokens:verify`
(`scripts/verify-tokens.ts` + 축 모듈 `scripts/lib/tokens/`)다. 셋만 기억하면 된다.

- **게이트는 하드월이 아니라 래칫이다** — 커밋된 기준선 대비 **늘면 실패**한다. 부채가 네
  자릿수인 상태에서 "0건이면 통과"로 올리면 게이트가 `build` 잡 안에서 `astro build` 앞에 돌고
  `deploy` 잡이 `needs: build` 로 물려 있어 **사이트 배포까지 멈춘다.** 0 으로 수렴하면
  그때 하드월로 승격한다 — **승격은 네 번 미뤄졌다**(KAN-072 · KAN-074 · KAN-075 · KAN-076 이
  각각 0 을 만들었다). 승격 조건은 「래칫 0」이 아니라 **「인식층이 다 열린 뒤의 래칫 0」**이었다:
  KAN-073 이 인식층 셋을 열자마자 0 이 778 로 다시 섰고, KAN-075 가 넷째를, KAN-076 이
  다섯째를, KAN-077 이 여섯째를 열 때마다 다시 비0 이 됐다.
  **KAN-077 로 그 조건이 처음 충족됐다 — 열 갈래가 더 없고 래칫이 0 이다.**
  진단 정본 §6 에 남은 것은 13항 하나인데 그것은 **지금 `src/**` 에 0건**이라 열 대상이 아니다
  (「0건이라 괜찮다」가 아니라 「0건인 동안 괜찮다」는 기록이다). 승격 자체는 별건이다 —
  하드월은 그 카드가 **CI 를 빨갛게 만들면서 착수**할 위험을 지므로, 인식층을 넓힌 커밋과
  섞지 않는다.
  **지금 무는 수를 여기 적지 않는다** — `bun run tokens:verify` 가 매 실행 낸다. 문서에 박은
  수는 반드시 낡고(이 자리가 실제로 그랬다), 낡은 수는 최신인 얼굴로 틀린 규모를 말한다.
  같은 이유로 진단 정본도 §0 표를 "기록이지 장부가 아니다"로 동결했다.
- **게이트의 「0」은 인식 범위 안에서의 0 이다 (KAN-073).** KAN-072 가 래칫을 0 으로 만들자마자
  드러난 것이 이것이다 — 추출 정규식이 **큰따옴표 문자열 값만** 봐서 인라인 숫자값
  (`style={{ padding: 18 }}`) · 삼항·템플릿 안 리터럴 · `.astro` 인라인 `style="…"` 속성이
  통째로 판정 밖이었다. 셋을 열었고 그만큼 기준선이 비0 으로 다시 섰다.
  **KAN-075 가 넷째를 열었다** — 줄바꿈을 넘는 CSS 선언(`ml-decl`). 값 클래스가
  `[^;{}\n]` 이라 `box-shadow:` 세 줄 같은 자리가 통째로 밖이었다.
  **KAN-077 이 여섯째를 열었다** — 상수로 끌어올린 리터럴(`const-ref`). 이 갈래만 리터럴이
  **값 자리에 없다** — 남는 것이 식별자뿐이라 앞의 다섯이 전부 버렸고, 그래서 **판정 대기
  리터럴을 `const` 로 올리기만 하면 게이트를 피할 수 있었다**(KAN-072 S10 실측: `158→0` 중
  6건이 그렇게 숨어 되돌려야 했다). 기법도 다르다 — 선언만 봐서는 `const TOTAL = 12` 와
  `const SAND = "#e8c97a"` 를 못 가르므로 정규식이 아니라 **사용처 추적**이고, **축은 참조된
  속성이 정한다**. **범위 한정이 전부다**: 리터럴 `const` 89개 중 71개가 값 자리 밖이라
  (SVG 기하 · 예시 데이터) 한정을 풀면 그것이 쏟아진다 — 그래서 `styleNum` 의 `scopesOf()` 를
  **직접 부른다**(정의가 두 벌이면 한쪽만 고쳐지고 그 어긋남은 「부채가 적다」로 통과한다).
  히트는 **참조가 아니라 선언 자리**에 낸다(고칠 곳이 거기다). 숫자 상수도 담는다 — 지금
  0건이지만 안 담으면 `const PAD = 18` 을 만들어 쓰는 순간 회피 경로가 다시 열린다.
  **KAN-076 이 다섯째를 열었다** — `stroke-width` 계열(`svg-stroke`). 속성이 축 표에 아예 없어
  네 형태가 통째로 밖이었다. 이 갈래는 **판정 전에 단위를 먼저 본다**: `--stroke-*` 3단은 CSS px
  자인데 SVG 안의 길이는 사용자 단위이고 **그 배율을 호출자가 정해서**(`<Mascot size={40}/>` 면
  0.238) 같은 소스 한 줄이 지면마다 다른 px 로 그려진다. 그래서 사용자 단위 자리는 위반이 아니라
  **판정 불가**이고, `width`·`height` 가 `viewBox` 치수 그대로인 자리만 3단과 대조한다 —
  실측 51 중 49 대 2 다. **단위를 드리프트 검사보다 먼저 보지 않으면 조용히 틀린다**:
  `strokeWidth: 2` 가 `--stroke-bold`(2px)와 값이 같아 드리프트로 잡히는데 그 SVG 는 래스터
  2배라 화면에서 4px 다.
  **인식층을 넓히면 그 커밋에서 기준선도 함께 갱신한다** — 나누면 그 사이 푸시에서 배포가 멈춘다.
  인식기는 `scripts/lib/tokens/recognize/` 의 갈래별 모듈이고 **각자 자기 고장 픽스처를 소유한다**
  (자가검사의 유일성 키가 `(판정, 사유, 인식 경로)` 셋인 이유가 그것이다 — 새 갈래는 CSS 자리와
  **똑같은 코드로** 판정되므로 사유가 겹친다). 아직 안 여는 것 하나는 진단 정본 §6 의 13항인데,
  **지금 0건이라 열 것이 없는 자리**다(그 항 자체가 「0건인 동안만 괜찮다」는 기록이다).
  **인라인 숫자값은 `13` 이 아니라 `13px` 로 판정되고 출력에는 `13(→13px)` 로 병기된다** —
  안 그러면 "고치는 법" 이 소스에서 grep 안 되는 값을 가리킨다.
- **인식층을 넓힐 때 옛 히트가 안 움직였음은 `bun run tokens:invariant` 가 증명한다 (KAN-075).**
  옛 집합이 감사 원자료 3,539 히트와 대조되는 자리라 거기가 움직이면 「이식이 맞는가」를
  판정할 방법이 사라지는데, 그 붕괴는 **빌드도 타입도 게이트도 초록인 채로** 일어난다 —
  래칫은 "늘었다/줄었다"만 말하지 **어느 집합이** 움직였는지는 안 말한다.
  하네스는 셋을 본다: ① 기준 커밋 스냅샷 대비 옛 판정 불변 ② 새·옛 인식 경로가 같은 자리를
  겹쳐 세지 않음 ③ 겹침 가드 자가검사. **옛 정규식을 고치는 대신 새 인식기를 붙여라** —
  KAN-075 실측으로, 옛 `DECL` 에 줄바꿈을 허용하는 「자연스러운 수정」은 옛 판정을 84건 늘리고
  같은 바이트를 105건 겹쳐 센다. **가드는 하나씩 죽여 빨개지는지 본 것만 남긴다** —
  KAN-075 가 셋 중 하나를 그렇게 지웠다(죽여도 아무 검사가 안 우는 가드는 있어 보이기만 한다).
- **예외는 파일 단위가 기본이고, 자리 단위로 좁힐 수 있다 (KAN-074).** `exceptions.ts` 의
  `site` 가 있으면 그 파일 **안에서 그 술어를 만족하는 히트만** 예외가 된다. 파일 단위로만
  걸면 값 하나를 지키려고 **그 파일의 준수분과 다른 부채까지 판정에서 통째로 내려간다** —
  KAN-072 가 구분 팔레트 11건을 예외로 안 올린 이유가 정확히 그것이었다. **줄 번호로 안 쓴다**
  (한 줄만 고쳐도 조용히 빗나가고, 빗나간 예외는 「부채가 늘었다」가 아니라 「예외가 안 걸린다」로
  나타나 원인을 못 짚는다) — 속성과 값으로 쓴다.
- **화면이 안 바뀌었음은 눈이 아니라 `bun run render:compare` 가 증명한다 (KAN-074).**
  격리 사본 둘(내 파일만 `HEAD` / 지금 상태)을 각각 구워 `getComputedStyle` 로 전수 대조한다.
  **직접 짜면 조용히 통과한다** — 인라인 hex 를 셀렉터로 세면 React 가 rgb() 로 정규화한 노드가
  빠지고, 셀렉터에 리터럴을 박으면 치환 후 0 이 되며, 브라우저가 죽어도 `evaluate` 는 안 끝난다.
  셋 다 실측으로 밟았고 `--self-test` 가 고장 4종 + 잡음 0 으로 매번 확인한다. 시간에 끌려다니는
  값(시뮬 타이머 · 외부 웹폰트 · Astro 가 끼우는 하이드레이션 노드)은 굳히거나 대조에서 뺀다.
  **「자가검사를 돌렸다」는 「대조를 했다」가 아니다 (KAN-078).** `--self-test` 는 하네스가 살아
  있는지만 보고 화면은 안 본다. 그런데 옛날에는 그 실행도 「✓ 전후 동일」로 끝나서 **대조를 한
  번도 안 한 실행이 통과로 읽혔다** — KAN-077 S8 에서 실제로 밟았다(그 줄을 받은 직후 옵션만
  빼고 다시 돌리니 28건이 나왔고 그 사이 코드는 한 글자도 안 바뀌었다). 지금은 **전후를 실제로
  안 잰 실행의 마지막 줄에 「대조 안 함」이 박히고**, 그 구분은 매 실행 첫머리에 도는
  `selfTestEnding()` 이 지킨다(옛 결말 · 표 밖 `process.exit` · 통과 문구 직접 인쇄 셋을 주입해
  무는지 본다). **판정은 마지막 줄과 종료코드 둘 다로 한다.**
- **"조화"·"어울리게" 같은 말은 규칙이 아니다.** 판정할 수 없는 낱말 아래에서 만들어진 것이
  준수율 3.6% 구획이다. 토큰 밖 색이 필요하면 **근거 문서의 위치**를 예외 목록에 함께 등록한다 —
  위치 없는 예외는 게이트가 안 받는다.
- **생성물은 대상이 아니다** — `src/styles/motion.css`(`gen:motion` 이 굽는다) ·
  `src/styles/viz.css`(패키지 복제물) · `AUTO-GENERATED` 헤더가 붙은 `apply-viz` 산출물.
  손으로 고치면 CI 가 막거나 다음 재생성에서 조용히 되돌아간다.

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
- **두들 마크(`DoodleMark.astro`)만 예외다 — 장식이 아니라 본문 기호다.** 본문에서
  **이모지 대신** 쓰는 손그림 기호 51종으로, MDX 에서 import 없이 `<Mark name="no" />`
  로 쓴다(`[...slug].astro` 가 꽂아 준다 — 대담에도 꽂힌다). 위 규칙 셋이 전부 뒤집힌다:
  강도로 사라지지 않고, `aria-label` 을 달며, `deco.css` 없이도 그려진다. 표는
  `src/lib/doodleMarks.ts` 하나이고 카탈로그는 `/design/deco`. 필기구별 필터·기준선
  규칙(전부 실측값)은 `deco-kit` 스킬.

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
  → review-post   (5-axis Korean review: 맞춤법/개연성/테크니컬 라이팅/몰입도/AI 문체 잔존)
       AI 문체 등급이 C·D 면 authoring-kit:authoring-gate 로 넘긴다 — 보완 루프에
       수정률 상한·의미 보존 가드가 있다. **에이전트가 본문을 쓴 경우에만**
  → make-image    (```viz``` blocks → bbangto-ui-visualization components; inline SVG + hero webp)
  → post-finalize (tags, series links, <<meme:>> delegation, emoji→두들 마크 — NO image generation)
  → publish-post  → src/content/posts/<slug>.mdx  (sets Astro frontmatter, deletes draft)
```

심층 기술 글은 더 긴 경로를 탄다:

```
research → tech-deepdive(집필) → review-post(미시) → review-writing(거시)
  → quality-gate(기술) → post-finalize → publish-post → ship-post

AI 리듬(`machine-rhythm`)은 별도 단계가 아니다 — 집필 시점에 L0 규칙으로 걸리고,
남은 것은 `authoring-gate` 의 보완 루프가 수정률 상한·의미 보존 가드와 함께 처리한다.
```

**집필 규칙은 이 저장소에 없다 — `authoring-kit` 플러그인이 소유한다.**
세 저장소(blog · code_test · resume)가 같은 규칙을 각자 한 벌씩 들고 있다가 갈라진 것을
정리한 결과다. 이 저장소에는 **매체 결정**(시각 자료 위탁 · 두들 마크 · 발행 파이프라인)만 남는다.

| 층 | 무엇 | 어디 |
| --- | --- | --- |
| L0 공통 원칙 | 증거 · 문법 · 이해 · AI 기계 리듬 | `~/.claude/authoring/principles/` |
| L1 퍼소나 | 빵관 토니 · 빵토랩 연구원 · 교수님 · 선생님 | `~/.claude/authoring/voices/` |
| L2 글 명세 | `tech-deepdive` · `polssin-daedam` | `.claude/authoring/specs/` |

**규칙 갈래마다 소유 층이 하나다.** 증거·문법·이해는 L0 단독이고 어떤 퍼소나도 무력화하지
못한다. 말투·호흡·독자 장치·어휘는 L1 단독, 항목 골격과 그 글만의 원칙은 L2 단독이다.
이 소유권이 없던 시절 **한 저자의 문체가 모든 퍼소나에 강제되던** 것을 고친 구조다.

**퍼소나마다 쓰임이 다르다.** `ppangto`(빵관 토니)는 `usage: "preserve"` 라
**AI 가 그 목소리로 새로 쓰지 않는다** — 사용자가 직접 쓴 초안을 다듬을 때 지킬 색으로만
본다. 빵토랩 셋은 `generate` 다. `author` frontmatter 가 어느 voice 를 쓸지 정한다.

규칙 전문을 보려면:

```bash
python3 ${CLAUDE_PLUGIN_ROOT}/scripts/authoring.py show spec tech-deepdive
python3 ${CLAUDE_PLUGIN_ROOT}/scripts/authoring.py resolve --voice <id> --spec <id> --profile main
```

`.claude/authoring.lock.json` 이 규칙 조합을 고정한다. `lock` 이 stale 이면 규칙이 바뀐
것이므로 무엇이 바뀌었는지 보고 진행할지 정한다.

**본문에 이모지를 쓰지 않는다 — 두들 마크로 쓴다.** `- ❌ **"…"**` 꼴의 "흔한 오해" 목록은
이 블로그가 자주 쓰는 형식인데, 이모지로 쓰면 기기마다 다른 그림이 나오고 컬러 이모지 폰트가
종이·크레용 팔레트와 겉돌며 AI 문체 신호(P3)로도 잡힌다. 대신 `<Mark name="no" />` ·
`<Mark name="check" />` · `<Mark name="warn" />` 을 쓴다(MDX 에서 import 불필요).
**뜻이 있는 기호는 지우지 말고 갈아 끼우고, 매핑에 없는 것은 장식이므로 지운다** —
`❌` 는 그 항목의 판정이라 지우면 맞는 항목과 틀린 항목이 같은 모양이 된다.
**코드블록 안의 `★`·`✔` 는 인용한 화면이라 건드리지 않는다.**
**제목에는 마크를 넣지 못한다 — 말로 풀어 쓴다**(목차 `PostToc` 는 `headings` 의 텍스트만
쓰는데 JSX 는 텍스트를 안 남겨 `자주 틀리는 포인트 ( → 교정)` 처럼 뚫린다). 볼드 앞머리는
마크를 볼드 **밖**으로 뺀다(`**❌ 안티패턴**` → `<Mark name="no" /> **안티패턴**`). 매핑표는
`src/lib/doodleMarks.ts`(`EMOJI_TO_MARK`), 카탈로그는 `/design/deco`, 발행 직전 그물은
`bun scripts/check-post-markers.ts`(**하드 실패** — KAN-062 로 옛 글 83건을 다 옮긴 뒤 올렸다).

**강조는 조사 앞에서 끊지 않는다 — `**창(window)**이` 는 화면에 별표가 그대로 나온다.**
CommonMark 는 닫는 `**` 의 **앞이 문장부호이면 뒤가 공백이나 문장부호일 때만** 강조를 닫는데,
한국어는 조사가 곧바로 붙어 이 조건이 깨진다. 괄호 병기 · 따옴표 인용 · 코드스팬으로 끝나는
볼드가 전부 여기 걸리고, **빌드도 타입도 초록이라 눈 말고는 잡히지 않았다**(지적 당시 발행 글
25편에 177쌍). 그래서 게이트가 있다 — `bun scripts/check-emphasis.ts`(소스) ·
`--dist`(렌더된 HTML, 정본). **둘 다 CI 하드 실패**이고 `ship-post` · `review-post` ·
`post-finalize` 가 같은 스크립트를 부른다. 표준 수리 셋: `**용어(term)**조사` →
`**용어**(term)조사`, `**"인용"**조사` → `"**인용**"조사`,
`` **`코드`**조사 `` → `` **`코드`조사** ``.

### Packet captures: VPN 캡처 랩 (별도 레포)

Wire-level 증거가 필요한 글(현재는 **VPN 해부 EP3~EP7**)은 캡처를 **직접 뜨지 않는다** —
실물 패킷 아티팩트가 `~/blog-research/raws/captures/<slug>/` 에 이미 있고, 랩은
`~/blog-research/lab/vpn-capture-lab/` 이다.

파일 목록·출처 표기·인용 규약(**발췌만, 디섹션 값은 위조하지 않고 자른다, 크기는 계층을 밝힌다**)은
**`tech-deepdive` 스킬의 `assets/CAPTURE_CITATION.md`** 에 있다. 정본 위키는
`~/blog-research/wiki/topics/vpn-capture-lab.md`.

### Visuals: bbangto-ui-visualization (viz engine) — NOT ChatGPT

All structured visuals (diagrams, charts, infographics, and the hero image) are **implemented directly in code** from the user's design-system package **`@centurio1987/bbangto-ui-visualization`** — the blog does **not** call ChatGPT/OpenAI for images (KAN-013).

- Authors leave a fenced ```` ```viz``` ```` block (JSON: `kind` + `data` + `caption`/`alt`). `make-image`/`image-maker` runs `scripts/apply-viz.ts`:
  - `target:"inline"` (default) → co-located `src/components/posts/<slug>/<Name>.tsx` (wraps a package component in `VizFigure`) + MDX import + `<Name />` — renders as **SSR static SVG, no hydration** (zero-JS paint via the global contract shim `src/styles/viz.css`).
  - `target:"hero"` → `scripts/render-viz.ts` (SSR → Playwright → cwebp/sharp) writes `public/images/<slug>/hero.webp` (also the OG/series-thumbnail raster).
- v1 kinds (`src/lib/viz/schema.ts`, Zod): `ProcessSteps` · `Comparison` · `Flowchart` · `Statistics` · `PosterHero` · `PosterEditorial`. Blog style guide: `src/lib/viz/blogVizStyleGuide.ts` (bound to tokens + `design-concept/DIAGRAM_STYLE_GUIDE.md`).
- **텍스트 넘침이 이 엔진의 고질병이다 (KAN-016 → 재발).** SVG `<text>` 는 리플로도 클리핑도 안 해서 긴 라벨이 **에러 없이** 밖으로 흘러 잘린다(빌드·타입 모두 초록). 그래서 자주 쓰는 kind 셋(`PosterHero` · `Comparison` · `ProcessSteps` = `LOCAL_VIZ_KINDS`)을 레포 로컬 구현으로 대체했고, **hero 는 반드시 `PosterHero`** 를 쓴다(패키지의 `PosterEditorial` 은 한 줄 `<text>` 라 한글 약 10자에서 조용히 잘린다).
  - **재발 방지는 권고가 아니라 `bun run viz:verify` 다** (`scripts/verify-viz.ts`). 비0으로 끝나면 그 그림은 못 나간다. 원인·로컬 구현의 계약(높이는 콘텐츠에서 되뽑고 저작 viewBox 는 폭만 계약)·래스터화 함정은 `.claude/skills/make-image/assets/IMAGE_GUIDE.md` R6.
- **GitHub Packages**: the package lives on `npm.pkg.github.com`. Project `.npmrc` only maps the `@centurio1987` scope → auth comes from your **global `~/.npmrc`** `read:packages` token, so local dev needs **no per-project setup** (`bun install` just works). CI (`main.yml`, `packages: read`) writes the token to `~/.npmrc` before install (`PACKAGES_READ_TOKEN` PAT if set, else the workflow `GITHUB_TOKEN`). Verify inline paint over **`astro preview` (HTTP)**, not `file://`.
- **Legacy (retired)**: `[[[…]]]`(OpenAI), ```figure```(make-image HTML templates), `(( ))`(mdx-concept-diagram) → all replaced by ```viz```. The deprecated stubs `scripts/generate-image.ts` / `render-image.ts` / `image-templates.ts` were removed in KAN-015 (viz engine is the only image path).

- `init-post` — skip the raws→draft pipeline: scaffold a ready-to-write post directly in `src/content/posts/` (draft:true).
- `publish-post` does NOT edit any nav/sidebar config — the collection auto-discovers.

## Notes

- `.obsidian/` (vault config) may exist — do not delete unless asked; the notes vault is separate from the site build.
- Deployment: `.github/workflows/main.yml` (Bun + `astro build` → GitHub Pages on push to `main`).
