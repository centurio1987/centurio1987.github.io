---
card: KAN-068-5KMRV8
title: UI QA
created: 2026-08-24
branch: KAN-068-5KMRV8
worktree: /Users/centurio/orca/workspaces/centurio1987.github.io/KAN-068-5KMRV8
base: fed67c2
status: 검토 대기
---

# KAN-068-5KMRV8 검토 요청 — UI QA

카드: [KAN-068-5KMRV8.md](../KANBAN.cards/KAN-068-5KMRV8.md)

> 이 문서는 **검토를 위한 산출물**이다. 수행 내역은 카드 실행 문서에 있고, 착수 전
> 계획은 배치 문서에 있다. 여기 있는 것은 "지금 이 브랜치를 무엇으로 판정하는가" 뿐이다.

## 1. 검토 대상

| 항목 | 값 |
|---|---|
| 브랜치 | `KAN-068-5KMRV8` |
| 워크트리 | `/Users/centurio/orca/workspaces/centurio1987.github.io/KAN-068-5KMRV8` |
| 베이스 | `fed67c2` |
| 변경 훑기 | `git diff fed67c2...HEAD` |

**커밋 6건**

```text
54a4dd8 KAN-068-5KMRV8 S5: 폭 체계를 정본에 박고, 재발을 잡는 게이트를 세운다
2adb467 KAN-068-5KMRV8 S4: 푸터 저자 라인업을 읽는 판 폭에 묶는다
acd0223 KAN-068-5KMRV8 S3: 글 지도를 넓은 판으로 — 폭 종류가 셋에서 둘로
5fb1814 KAN-068-5KMRV8 S2: 홈을 넓은 판 토큰으로 — GNB 와 본문이 같은 선에 선다
5a19513 KAN-068-5KMRV8 S1: 폭 토큰 둘로 나누고 셸이 지면 폭을 따라가게 배선
bf92128 kanban: KAN-068-5KMRV8 착수 — 진행 중으로 이동, 배치1(S1~S3) 착수 시점 판단 기입
```

**변경 파일 19개 (+380 −68)**

| 파일 | 상태 | 추가 | 삭제 |
|---|:--:|---:|---:|
| `.kanban/archive.jsonl` | M | 1 | 0 |
| `.kanban/log.md` | M | 1 | 1 |
| `.kanban/state.json` | M | 15 | 16 |
| `KANBAN.batches/KAN-068-5KMRV8.batch1.md` | M | 12 | 2 |
| `KANBAN.batches/KAN-068-5KMRV8.batch2.md` | M | 12 | 2 |
| `KANBAN.board.html` | M | 4 | 4 |
| `KANBAN.cards/KAN-068-5KMRV8.md` | M | 51 | 27 |
| `KANBAN.md` | M | 8 | 8 |
| `design-concept/DESIGN_CONCEPT.md` | M | 47 | 1 |
| `package.json` | M | 1 | 0 |
| `scripts/verify-widths.ts` | M | 174 | 0 |
| `src/components/AuthorLineup.astro` | M | 8 | 0 |
| `src/components/Footer.astro` | M | 2 | 1 |
| `src/components/Header.astro` | M | 2 | 1 |
| `src/layouts/BaseLayout.astro` | M | 14 | 1 |
| `src/pages/graph.astro` | M | 5 | 1 |
| `src/pages/index.astro` | M | 5 | 3 |
| `src/styles/global.css` | M | 8 | 0 |
| `src/styles/tokens.css` | M | 10 | 0 |

**롤백 태그 7개**

```text
kan/KAN-068-5KMRV8/S1
kan/KAN-068-5KMRV8/S2
kan/KAN-068-5KMRV8/S3
kan/KAN-068-5KMRV8/S4
kan/KAN-068-5KMRV8/S5
kan/KAN-068-5KMRV8/batch1
kan/KAN-068-5KMRV8/batch2
```

## 2. 검증 — 기준과 실행 결과

<!-- 기준은 카드 실행 문서 「검증」 절의 사본이다. 정본은 KANBAN.cards/KAN-068-5KMRV8.md 이므로
     기준이 바뀌면 그쪽을 고치고 review-init --refresh 로 이 항만 다시 뜬다.
     결과는 착수한 쪽이 이미 돌린 것이다 — 검토자에게 다시 돌리라고 시키지 않는다.
     **다시 돌려 아래와 다르게 나오면 그 자체가 반려 사유다.** -->

**기준**

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

**실행 결과**

```text
7종 전부 통과 (2026-08-24, 워크트리 KAN-068-5KMRV8 @ 54a4dd8)

bun run build                     46 page(s) built · Complete
bun run width:verify              지면 5개 · 모든 지면에서 셸과 본문 폭이 일치
    / 1100·1100·1100·1100  /graph 1100·1100·1100
    /posts 720·720·720  /404 720·720·720  /posts/orca-dev-env 720·720·720
bun run deco:verify               지면 3 × 폭 5 + 글 상세 전수, 검사 50회 · 겹침·가로챔·오버플로 없음
bun run viz:verify                글 27편 / figure 43개 · 텍스트 넘침 없음
bun scripts/check-emphasis.ts     소스 30개 파일 · 렌더되지 않는 강조 없음
    --dist                        렌더 46개 파일 · 없음
bun scripts/check-post-markers.ts 30개 글 · 미처리 마커·본문 이모지 없음
bun scripts/check-quote-blocks.ts 30개 글 · 인용에 무너진 문단 없음

역검증(게이트가 실제로 잡는가): graph.astro 에서 width="wide" 만 떼고 빌드하면
    grep -rnE 'max-width: *[0-9]{3,}px' src/  -> 0건 (CSS 에 숫자가 없다)
    bun run width:verify                       -> FAIL /graph  header-inner=720 · graph-page=1100
되돌려 놓았고 diff 는 비어 있다.

푸터 라인업 실측(뷰포트 1440·1024 둘 다, S4 전 -> 후):
    넓은 판 /·/graph   판 1004 -> 624 · 액자사이 149 -> 54 · 액자 102x117 (불변)
    읽는 판 /posts·/404 판 624 · 액자사이 54 · 액자 102x117 (불변)
```

## 3. 판단 항목 — 스크립트가 판정할 수 없는 것

<!-- 스크립트가 판정할 수 없는 것만 적는다 — 값의 진위, 선택지 중 하나를 고른 근거,
     범위를 그은 자리. 2항에서 이미 돌아간 검증을 여기 옮겨 적지 않는다.
     한 줄 형식: 체크박스 하나에 의견 하나 — "<주제> — <지금 고른 값과 그 근거>".
     **의견마다 「상세」 접기가 따라붙는다** — 검토자는 이 카드를 수행하지 않았으므로
     내부 기호(`L10`·`P5`·`S8`)만 던지면 판정할 재료가 없다. 상세에는 그 기호를 풀어
     쓰고 원문 경로(`파일:줄`)나 링크를 건다.
     비어 있으면 "기계가 다 판정했고 사람이 정할 것이 없다"는 뜻이다. 그 판단도
     착수한 쪽이 하는 것이지 검토자가 빈칸을 보고 추측할 일이 아니다.
     **승계 절(3-0)이 있으면 그것이 먼저 온다** — 다른 검토서에서 넘어온 의견이고,
     판정은 승계를 받은 이 문서 하나에서만 내려진다. -->

**의견마다 판정과 추가 의견이 따로 붙습니다.** 판정은 상태이고 추가 의견은 말입니다 — 승인/반려를 아직
안 정했어도 의견 하나에만 추가 의견을 달 수 있고, 반대로 의견 하나만 먼저 닫을 수도 있습니다.
`<번호>`는 의견 순서이고, 주제의 문구 일부로도 찾습니다.

```
# 판정 — 승인 · 반려 · 철회
python3 scripts/kanban.py review-judge <project-root> --card KAN-068-5KMRV8 --item <번호> --verdict 승인
# 추가 의견
python3 scripts/kanban.py review-note <project-root> --card KAN-068-5KMRV8 --item <번호> --text "<추가 의견>"
# 추가 의견을 반영하다 새 의견이 생겼으면 (맨 뒤에 붙어 앞 번호가 안 밀립니다)
python3 scripts/kanban.py review-item <project-root> --card KAN-068-5KMRV8 --add "<주제>
  <상세>"
```

**전체 승인은 살아있는 항목이 전부 승인일 때만 섭니다**(철회는 분모에서 빠집니다). 하나라도
반려·추가 의견·미정이면 4항의 전체 승인도 `→ 완료` 이동도 종료코드 14로 거부됩니다.

- [ ] 지적 1(홈과 블로그 탭의 폭이 다르다)을 값이 아니라 규칙으로 닫은 것을 실물로 보고도 받아들이시겠습니까 — 홈 1100px, 글 목록 720px 로 값은 그대로 다릅니다
    - **상세** — 카드 원문 첫 줄이 "메인 컨텐츠 섹션의 폭이 main 화면과 블로그 탭이 서로 다르다. 일관성을 지킬 필요가 있다" 입니다(KANBAN.md 의 이 카드 원문 블록). 2026-08-24 에 고르신 안 1 은 값을 맞추는 대신 "한 화면 안에서 셸과 본문이 같은 선" 을 일관성으로 정의합니다. 값을 맞추는 두 안을 버린 근거는 실측입니다 — 720 통일은 홈 히어로 한 열이 294px(720 - 좌우 패딩 48x2 - 열 간격 36, 반)로 줄어 회전한 폴라로이드 바운딩 141px 이 들어갈 타이틀 우측 여백이 사라지고(실측 주석: src/pages/index.astro:169-172, 769px 에서 129px · 964px 에서 166px), 1100 통일은 design-concept/DESIGN_CONCEPT.md:106 "포스트 본문 max-width 720px" 을 뒤집고 읽는 지면 8곳이 재디자인 대상이 됩니다. 새 규칙 전문은 design-concept/DESIGN_CONCEPT.md 「6. 레이아웃 → 폭 체계」. 실물 확인: bun run preview 로 / 와 /posts 를 나란히 열어 보시면 됩니다

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] 푸터까지 셸에 넣어 넓힌 것을 그대로 두시겠습니까, 아니면 헤더만 지면을 따라가게 할까요 — 지금 푸터는 폭을 넓혀도 화면이 달라지지 않습니다
    - **상세** — 카드 원문 둘째 줄은 GNB 만 말합니다("main 화면에서 GnB 컨텐츠 폭과 메인 컨텐츠 섹션의 폭이 서로 다르다", KANBAN.md 의 이 카드 원문 블록). 저는 셸을 헤더+푸터 한 벌로 보고 둘 다 var(--shell-max, var(--content-max)) 로 바꿨습니다(src/components/Header.astro:35 · src/components/Footer.astro:54). 그런데 푸터 안쪽 콘텐츠는 전부 중앙 정렬이고(src/components/Footer.astro:58-60 의 세로 flex + align-items:center), 유일하게 폭을 따라가던 저자 라인업은 다섯째 work 에서 다시 624px 로 묶었으므로(src/components/AuthorLineup.astro:173 부근의 max-width) 푸터의 넓은 판 적용은 현재 시각적으로 아무 효과가 없습니다. 남겨 둘 근거는 "셸의 정의가 한 벌이어야 다음 사람이 헷갈리지 않는다", 뺄 근거는 "효과 없는 배선은 없는 편이 낫다" 입니다

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] 저자 라인업 상한을 calc(var(--content-max) - var(--page-pad) * 2) 로 표현한 것을 그대로 두시겠습니까, 전용 토큰을 팔까요
    - **상세** — 값은 src/components/AuthorLineup.astro 의 .author-lineup 규칙에 있고 "읽는 판의 콘텐츠 폭"(뷰포트 1440 에서 624px)을 뜻합니다. 원 토큰은 src/styles/tokens.css:42 의 --content-max 720px 와 같은 파일의 --page-pad clamp(20px, 5vw, 48px) 입니다. px 를 직접 박지 않은 이유는 이 카드가 없애려던 하드코딩을 푸터에 되살리지 않기 위해서입니다(규칙은 design-concept/DESIGN_CONCEPT.md 「폭 체계」). 다만 이 계산식은 지금 이 한 곳에서만 쓰이고, 같은 뜻의 값이 또 필요해지면 각자 계산하게 됩니다 — 전용 토큰(예: --content-inner)을 tokens.css 에 파면 그 위험이 없어지는 대신 토큰이 하나 늘어납니다

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._

- [ ] bun run width:verify 를 CI 에 넣을까요, 로컬 게이트로 둘까요
    - **상세** — 이번에 만든 게이트입니다(scripts/verify-widths.ts, package.json 의 width:verify). 지금 CI 가 돌리는 것은 .github/workflows/main.yml:46 check-post-markers · :51 check-emphasis · :56 check-quote-blocks · :68 astro build · :71 check-emphasis --dist 다섯이고, deco:verify 와 viz:verify 는 그 파일에 **없습니다** — 브라우저(Playwright)를 띄우는 검사는 로컬에만 두는 것이 이 레포의 현재 관례입니다. width:verify 도 scripts/verify-widths.ts 에서 playwright 를 import 합니다. 관례를 따르면 로컬에 두고, 관례를 바꾸면 셋(deco·viz·width)을 함께 올리는 것이 일관됩니다

    > **판정** — _아직 없습니다._

    > **추가 의견** — _아직 없습니다._


## 4. 판정

<!-- 문서 하나에 대한 판정이다. **항목별로 갈리는 말은 여기 적지 않는다** — 3항 각 의견의
     「판정」과 「추가 의견」이 그 자리다. 여기 남는 것은 그 항목들이 전부 승인으로 닫혔다는
     사실 하나뿐이다.
     아래 「판정 이력」은 **덧붙기만 하는 이력**이다. 왕복이 돌면 줄이 쌓이고, 그것이 이 문서가
     무엇을 거쳐 승인에 닿았는지의 전부다 — 지우지 않는다. **판정에는 사유 칸이 없다** —
     승인은 대체로 덧붙일 말이 없고, 있다면 그것은 문서 전체가 아니라 그 항목에 대한
     말이라 3항의 「추가 의견」이 받는다.
     `review-judge --card KAN-068-5KMRV8 --verdict 승인` 이 이 자리를 쓰고
     frontmatter 의 status 도 함께 고친다. 손으로 적어도 되지만, 그때는 수렴 검사를
     안 거치므로 `validate` 가 항목 판정과 어긋난 승인을 error 로 잡는다. -->

**판정**: (아직 없습니다)

**판정 이력**:

- 승인이면 → `apply --op move --id KAN-068-5KMRV8 --to done` 뒤에 `main` 병합과 워크트리 정리(출력의 `cleanup`)
- 반려면 → `apply --op move --id KAN-068-5KMRV8 --to doing` 뒤에 `doc-log --entry "<반려 사유>"`.
  요청서는 **지우지도 다시 뜨지도 않는다** — 고친 뒤 그 항목을 `review-judge --verdict 승인` 으로
  뒤집으면 같은 문서에서 수렴한다. 1·2항이 낡았으면 `review-init --refresh` 로 그 두 항만 간다.
