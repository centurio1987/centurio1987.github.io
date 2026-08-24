---
card: KAN-068-5KMRV8
title: UI QA
created: 2026-08-24
scope: src/styles/tokens.css, src/layouts/BaseLayout.astro, src/components/Header.astro, src/components/Footer.astro, src/pages/index.astro, src/pages/graph.astro, design-concept/DESIGN_CONCEPT.md
---

# KAN-068-5KMRV8 — UI QA

## 전략
지시 원문은 `KANBAN.md` 카드의 `원문:` 블록에 있다(중복 보관하지 않음).

**진단 — 지적 두 건은 같은 뿌리다.** 페이지 컨테이너 폭 토큰이 하나(`--content-max: 720px`,
`src/styles/tokens.css:42`)뿐인데 세 지면이 그것을 안 쓰고 값을 박아 뒀다.

| 지면 | 폭 | 근거 |
| --- | --- | --- |
| GNB(헤더) · 푸터 | `--content-max` 720px | `Header.astro:35` · `Footer.astro:54` |
| 홈 히어로 · 최근 글 | **1100px 하드코딩** | `index.astro:162` · `index.astro:274` |
| 글 지도 | **960px 하드코딩** | `graph.astro:410` |
| 글 목록 · 카테고리 · 글 상세 · 대담 · 404 | `--content-max` 720px | `posts/index.astro:85` · `[category].astro:57` · `PostLayout.astro:171` · `TalkLayout.astro:148` · `404.astro:18` |

지적 1(홈 ≠ 블로그 탭)은 1100 대 720이고, 지적 2(홈에서 GNB ≠ 콘텐츠)는 같은 판에서 720 대 1100이다.
전수 확인 결과 페이지 컨테이너 하드코딩은 위 세 곳이 전부다(`grep -rnE 'max-width: *[0-9]{3,}px' src/`).
`/design/*` 카탈로그(1180px, noindex)는 독자용이 아니라 범위 밖이다.

**접근 — 두 폭 토큰 + 셸이 지면을 따라간다** (유저 선택, 2026-08-24).

디자인 정본이 근거다. `design-concept/DESIGN_CONCEPT.md:106`의 720px은 **"포스트 본문"**에 붙은 값이고,
같은 문서 90~96행은 홈 히어로를 `1fr 1fr` 2열 그리드 + 마스코트로 따로 규정한다. 정본은 이미
"지면마다 폭이 다르다"를 전제하며 홈 폭 1100px을 금지한 곳은 없다. 정본에 없는 것은 그 **규칙**이고,
실제로 깨진 것은 둘이다 — 규칙이 토큰에 없다는 것, 그리고 셸이 그 규칙을 안 따른다는 것(지적 2).
그래서 값을 통일하는 대신 규칙을 토큰과 문서에 박는다.

- `--content-max: 720px` 유지 = **읽는 판** (글 목록 · 카테고리 · 글 상세 · 대담 · 404)
- `--wide-max: 1100px` 신설 = **넓은 판** (홈 · 글 지도). 글 지도 960px도 여기로 흡수한다
- Header/Footer는 `var(--shell-max, var(--content-max))`를 읽고, `BaseLayout`의 `width="wide"`가
  `--shell-max: var(--wide-max)`를 깐다 → 셸이 지면 폭을 따라간다. 폴백을 둔 이유는 prop을
  안 넘긴 지면 8곳이 지금과 한 픽셀도 달라지지 않아야 하기 때문이다

**버린 대안 둘.** 둘 다 지적 1을 문자 그대로 풀지만 실측 비용이 지면을 망가뜨린다.

- **720px 단일 통일** — 히어로 2열이 열당 294px(720 − 패딩 48×2 = 624, gap 36 제외)로 줄고,
  폴라로이드 회전 바운딩 141px이 들어갈 타이틀 우측 여백이 사라진다(`index.astro` 실측 주석:
  769px에서 129px · 964px에서 166px). 글 지도 캔버스도 960→720으로 노드가 밀집한다.
- **1100px 단일 통일** — `DESIGN_CONCEPT.md:106`을 뒤집어야 하고, 글 목록 행(날짜 160px | 제목 |
  화살표)이 1100px로 벌어지며 글 상세 히어로·PostNav·SeriesEpisodes 카드가 전부 커진다.
  읽는 지면 8곳 재디자인이다.

**남는 것 하나 — 지적 1은 값으로 풀리지 않는다.** 홈 1100 ≠ 블로그 탭 720이 그대로 남고,
일관성은 "같은 값"이 아니라 "같은 규칙"으로 성립한다. 유저가 그 조건을 알고 고른 선택이다.

**회귀 위험은 푸터가 넓어지는 쪽 하나다.** `AuthorLineup`은 `width:100%` +
`grid-template-columns: repeat(var(--n), minmax(0,1fr))`이라(`AuthorLineup.astro:173`·`:176`)
푸터가 720→1100이 되면 저자 컷아웃 칸이 그만큼 벌어진다. `deco.css`에 폭에 걸린 좌표는 없지만
(grep 0건) 라인업 자체는 폭에 비례한다 — S4에서 실측하고, 벌어지면 라인업에만 현행 렌더 폭
상한을 주고 중앙 정렬한다.

## 실행 계획
<!-- `S<n>`은 고정 id — 이름을 바꾸지 않는다. 체크 상태는 doc-step 이 갱신한다. -->
- [x] `S1` 토큰·셸 배선 — `--wide-max` 신설 + `--shell-max` 규약
      `tokens.css`에 `--wide-max: 1100px` 추가(주석에 "읽는 판/넓은 판" 규칙과 근거를 단다).
      `Header.astro:35`·`Footer.astro:54`의 `max-width`를 `var(--shell-max, var(--content-max))`로.
      `BaseLayout`에 `width?: "read" | "wide"` prop(기본 `"read"`)을 추가하고 `<body>`에
      클래스로 `--shell-max: var(--wide-max)`를 깐다.
      완료 기준: `bun run build` 통과. prop을 안 넘긴 지면 8곳의 셸 렌더 폭이 720px 그대로다.
- [x] `S2` 홈 전환 — 하드코딩 2곳 제거
      `index.astro:162`(`.hero-inner`)·`:274`(`.recent`)의 `1100px` → `var(--wide-max)`,
      `BaseLayout`에 `width="wide"`.
      완료 기준: `/`에서 `.header-inner`·`.hero-inner`·`.recent`·`.footer-inner` 렌더 폭이
      모두 1100px로 같다(브라우저 실측). 히어로 폴라로이드 우측 여백과 900px 접힘
      브레이크포인트가 변경 전과 동일. `bun run deco:verify` 통과.
- [x] `S3` 글 지도 전환 — 960px 흡수
      `graph.astro:410`(`.graph-page`)의 `960px` → `var(--wide-max)`, `width="wide"`.
      완료 기준: `/graph`에서 셸·콘텐츠 폭이 1100px로 같다. 그래프 캔버스가 1100px에서
      노드 겹침·클리핑 없이 그려진다(실측). `deco:verify` 통과.
- [x] `S4` 푸터 저자 라인업 1100px 회귀 확인
      넓은 판 두 지면(`/`·`/graph`)에서 푸터 라인업 칸이 벌어지는지 잰다. 벌어지면
      `AuthorLineup`에만 현행 렌더 폭 상한을 주고 중앙 정렬한다(셸 폭은 안 되돌린다).
      완료 기준: 넓은 판과 읽는 판에서 저자 컷아웃의 렌더 크기가 같다. `deco:verify` 통과.
- [x] `S5` 정본 반영 + 재발 그물
      `DESIGN_CONCEPT.md`에 「폭 체계」 절 추가 — 읽는 판 720 / 넓은 판 1100 / 셸은 지면을
      따른다 / **페이지 컨테이너에 px 하드코딩 금지**. 지면별 표를 함께 싣는다.
      완료 기준: 절이 문서에 있고, `grep -rnE 'max-width: *[0-9]{3,}px' src/ | grep -v
      'src/pages/design/'` 결과에 페이지 컨테이너가 0건이다.

## 검증
<!-- 무엇을 실행해 무엇이 나오면 이 카드가 끝난 것인가. -->
아래 넷이 전부 초록이면 끝난 것이다.

**1. 지면 안에서 셸과 본문 폭이 같다 (지적 2) — 이것이 정본 판정이다**

```bash
bun run width:verify
```

`scripts/verify-widths.ts` 가 지면마다 `.header-inner` · 페이지 컨테이너 · `.footer-inner` 의
렌더 폭을 재서 셋이 한 값인지 본다. **어느 값이어야 하는지는 안 본다** — 홈 1100 과 글 목록 720 은
설계대로 다르고, 판정하는 것은 지면 안의 일치다. 비0 이면 그 화면은 못 나간다.

기대:

| 지면 | 기대 |
| --- | --- |
| `/` · `/graph` | 셋 다 **1100** |
| `/posts` · `/404` · 글 상세 | 셋 다 **720** |

**눈으로 하지 않는 이유**는 역검증으로 확인했다 — `graph.astro` 에서 `width="wide"` 만 떼면
CSS 에 숫자가 없어 grep 은 0건인데 `width:verify` 는 `header-inner=720 · graph-page=1100` 으로
잡는다. 홈과 글 지도가 어긋난 채 오래 남아 있던 것이 정확히 이 방향이다.

**2. 빌드·기존 게이트 회귀 없음**

```bash
bun run build
bun run deco:verify
bun run viz:verify
bun scripts/check-emphasis.ts && bun scripts/check-emphasis.ts --dist
bun scripts/check-post-markers.ts
```

**3. 페이지 컨테이너 하드코딩 0건 (보조 검색)**

```bash
grep -rnE 'max-width: *[0-9]{3,}px' src/ | grep -v 'src/pages/design/' | grep -v '@media'
```

`.hero-inner` · `.recent` · `.graph-page` · `.header-inner` · `.footer-inner` 가 한 건도
안 나와야 한다. 남는 것은 컴포넌트 내부 상한뿐이며 대상이 아니다 — `AuthorProfile` 440px ·
글 삽화 `Shot` 562px · `TalkLayout` 화자 카드 520px · 홈 히어로 이미지 380/500px.

**4. 푸터 저자 라인업이 판 폭에 안 끌려간다**

넓은 판(`/` · `/graph`)과 읽는 판(`/posts` · `/404`)에서 라인업 판 폭과 액자 사이 간격이 같아야
한다. 실측 기대값은 판 624px · 액자 102×117 · 액자 사이 54px 이다(뷰포트 1440·1024 둘 다).

**5. 정본에 규칙이 있다**

`design-concept/DESIGN_CONCEPT.md` 「6. 레이아웃 → 폭 체계」 절에 읽는 판/넓은 판 표, 배선 셋,
푸터 라인업 예외, 그리고 `width:verify` 가 판정한다는 사실이 적혀 있다.

## 수행 내역
<!-- KANBAN:LOG append-only — 아래로만 덧붙인다. 위를 고치지 않는다. -->
- 2026-08-24T15:34 · s:a25c9233 — `전략` 섹션 교체
- 2026-08-24T15:34 · s:a25c9233 — `실행 계획` 섹션 교체
- 2026-08-24T15:34 · s:a25c9233 — `검증` 섹션 교체
- 2026-08-24T16:13 · s:a25c9233 · S1 doing — 착수
- 2026-08-24T16:14 · s:a25c9233 · S1 done — --wide-max 1100px 신설 · Header/Footer 를 var(--shell-max, var(--content-max)) 로 · BaseLayout width prop + body.shell-wide. 빌드 통과, shell-wide 단 지면 0건이라 읽는 판 8곳 무변화 확인
- 2026-08-24T16:16 · s:a25c9233 · S2 doing — 착수
- 2026-08-24T16:18 · s:a25c9233 · S2 done — index.astro 의 1100px 2곳을 var(--wide-max) 로, BaseLayout 에 width=wide. 실측: / 의 header-inner·hero-inner·recent·footer-inner 가 모두 1100px 로 일치(지적 2 해결). deco:verify 50회 통과, 읽는 판 4지면 720px 무변화
- 2026-08-24T16:19 · s:a25c9233 · S3 doing — 착수
- 2026-08-24T16:22 · s:a25c9233 · S3 done — graph.astro 의 960px 을 var(--wide-max) 로, BaseLayout width=wide. 실측: /graph 의 header-inner·graph-page·footer-inner 모두 1100px. 지도는 viewBox 좌표계라 그림째 확대 — 겹침·클리핑·가로 넘침 0(스크린샷 확인). deco:verify 50회 통과. 폭 종류가 720·960·1100 셋에서 둘로 줄었다
- 2026-08-24T16:25 · s:a25c9233 · S4 doing — 착수
- 2026-08-24T16:27 · s:a25c9233 · S4 done — 회귀 확인됨 — 액자는 14vw clamp 라 102x117 로 같았지만 판이 624->1004 로 늘어 액자 사이가 54->149px, --sag 가 px 고정이라 처짐이 밋밋해졌다. 셸은 그대로 두고 .author-lineup 에만 max-width: calc(var(--content-max) - var(--page-pad)*2) 를 줬다(px 하드코딩 대신 토큰). 결과: 넓은 판/읽는 판 네 지면 모두 판=624 액자사이=54 로 동일, deco:verify 통과
- 2026-08-24T16:27 · s:a25c9233 · S5 doing — 착수
- 2026-08-24T16:33 · s:a25c9233 — `검증` 섹션 교체
- 2026-08-24T16:33 · s:a25c9233 · S5 done — DESIGN_CONCEPT.md 6절 맨 앞에 「폭 체계」 신설(읽는 판/넓은 판 표 · 배선 셋 · 라인업 예외 · 통일안을 버린 근거). 재발 그물은 문서가 아니라 게이트로 — scripts/verify-widths.ts + bun run width:verify 신설, 역검증(width=wide 제거)에서 grep 0건인데 게이트는 FAIL 로 잡는 것 확인. 카드 검증 절도 갱신
