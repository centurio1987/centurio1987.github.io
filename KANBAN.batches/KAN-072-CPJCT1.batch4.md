---
card: KAN-072-CPJCT1
batch: 4
created: 2026-08-27
branch: KAN-072-CPJCT1
status: 계획
steps: S6, S7, S8
---

# KAN-072-CPJCT1 배치4 — posts 밖 나머지 셋 — 글 컴포넌트 · 셸 · viz (병렬 3)

카드: [KAN-072-CPJCT1.md](../KANBAN.cards/KAN-072-CPJCT1.md) · 범위 `S6` · `S7` · `S8`
선행: [배치3](KAN-072-CPJCT1.batch3.md)

> **이 문서는 착수 전 계획이다.** 수행 내역은 카드 실행 문서의 「수행 내역」에 있다.

## 1. 작업 패키지

### WP1 · `S6` 글 컴포넌트·레이아웃 — 13파일 209건

`TalkLayout`(40) · `PostList`(29) · `AuthorProfile`(24) · `PostFilter`(24) · `PostLayout`(20) ·
`RelatedPosts`(18) · `SeriesEpisodes`(14) · `talk/QA`(12) · `PostToc`(10) · `talk/PullQuote`(8) ·
`PostNav`(6) · `CategoryBadge`(3) · `AiBanner`(1).

**폭신 대담(`TalkLayout`)이 여기 있다.** `CLAUDE.md` 의 "대담은 제외한다"는 **데코 키트**를
안 얹는다는 뜻이지 토큰을 안 쓴다는 뜻이 아니다 — 감사가 이미 그렇게 판정했다
(`UI_CONSISTENCY_AUDIT.md` §3-7). 대담은 자기 시각 언어가 있으므로 **화면이 바뀌면 그 자리에서
멈추고 기록한다.**

### WP2 · `S7` 페이지·셸 — 9파일 53건

`index.astro`(17) · `categories/[category]`(7) · `FeedLink`(6) · `graph.astro`(5) · `Footer`(5) ·
`404`(4) · `posts/index`(4) · `Header`(4) · `Logo`(1).

**공용 셸은 이미 83.4% 를 지킨다**(감사 §3-2 구획 H). 남은 것이 적고 성격이 균일하다.

### WP3 · `S8` viz·전역 스타일 — 2파일 53건

`src/styles/viz-frame.css`(41) · `src/styles/global.css`(12).

`viz-frame.css:285-286` 이 `deco/Tape.astro:102-103` 과 **같은 값을 복제**했고, 액자 종이색
`#fffcf6` 도 `Polaroid.astro:42` · `PhotoFrame.astro`(5자리) · `viz-frame.css:68,158` 이 각자
적는다(감사 §3-9). **배치3 의 WP3(데코)와 값이 같은 자리**이므로, 배치3 이 정한 토큰을 그대로 쓴다.
`DIAGRAM_STYLE_GUIDE.md:21` 은 배경을 `--paper`/`--surface` 로 **제한**한다 — 예외 문장이 없다.

**공통 완료 기준**: 배치3 과 같다. 화면 대조 지면은 홈 · 글 목록 · 글 상세 · 대담 · 404.

## 2. 의존과 순서

선행은 배치3 이다 — **`S8`(viz)이 배치3 의 `S5`(데코)가 정한 종이색 토큰을 그대로 써야
복제가 실제로 없어진다.** 배치3 과 같은 웨이브에 두면 두 세션이 같은 값을 각자 정한다.

세 WP 사이에는 순서가 없다. 커밋 규약·기준선 갱신은 배치3 과 같다.

**단일 에이전트 안과의 대비.** 315건이라 한 세션으로도 배치 **1개**에 들어간다. 이 배치는
오케스트레이션의 이득이 가장 작다 — 벽시계만 줄고 리스크는 같다.

## 3. 리스크

- **`TalkLayout` 은 자기 시각 언어를 가진 지면이다.** 토큰으로 옮기다 대담의 색감이 바뀌면
  그것은 부채 청산이 아니라 디자인 변경이다. 바뀌면 멈추고 기록한다.
- **`global.css` 는 전 페이지에 깔린다**(`BaseLayout.astro:2`). 여기서 값을 잘못 옮기면
  한 지면이 아니라 사이트 전체가 바뀐다.
- 되돌리기: 구획별 커밋.

## 4. 착수 시점 판단
<!-- 착수할 때 채운다 — 마지막 work 를 다음 배치로 미룰지 여기서 정한다. -->
