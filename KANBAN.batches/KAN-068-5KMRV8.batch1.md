---
card: KAN-068-5KMRV8
batch: 1
created: 2026-08-24
branch: KAN-068-5KMRV8
status: 완료
steps: S1, S2, S3
---

# KAN-068-5KMRV8 배치1 — 두 폭 토큰 배선과 넓은 판 두 지면 전환

카드: [KAN-068-5KMRV8.md](../KANBAN.cards/KAN-068-5KMRV8.md) · 범위 `S1` · `S2` · `S3`
선행: 없음 (이 카드의 첫 배치)

> **이 문서는 착수 전 계획이다.** 수행 내역은 카드 실행 문서의 「수행 내역」에 있다.

## 1. 작업 패키지

### WP1 · `S1` 토큰·셸 배선 — `--wide-max` 신설 + `--shell-max` 규약

- `src/styles/tokens.css` — `--content-max` 옆에 `--wide-max: 1100px` 추가. 주석에
  "읽는 판 / 넓은 판" 규칙과 근거(`DESIGN_CONCEPT.md:106` · 히어로 2열 규정)를 단다.
- `src/components/Header.astro:35` · `src/components/Footer.astro:54` —
  `max-width: var(--content-max)` → `var(--shell-max, var(--content-max))`.
- `src/layouts/BaseLayout.astro` — `width?: "read" | "wide"` prop(기본 `"read"`) 추가.
  `<body>` 에 클래스를 걸고 그 클래스가 `--shell-max: var(--wide-max)` 를 깐다.
  커스텀 프로퍼티는 스코프와 무관하게 상속되므로 Header/Footer 자식에 그대로 닿는다.

**완료 기준**: `bun run build` 통과. `width` prop 을 안 넘긴 지면 8곳
(`/posts` · 카테고리 · 글 상세 · 대담 · `/404` 등)의 `.header-inner`·`.footer-inner`
렌더 폭이 720px 그대로다. 이 시점에 홈·글 지도는 아직 안 고쳤으므로 지적 2가 남아 있어도 정상.

### WP2 · `S2` 홈 전환 — 하드코딩 2곳 제거

- `src/pages/index.astro:162`(`.hero-inner`) · `:274`(`.recent`) — `1100px` → `var(--wide-max)`.
- 같은 파일의 `<BaseLayout>` 호출에 `width="wide"`.

**완료 기준**: `/` 에서 `.header-inner` · `.hero-inner` · `.recent` · `.footer-inner` 의
렌더 폭이 모두 1100px 로 같다(브라우저 실측 — 지적 2 해결). 히어로 폴라로이드의 타이틀 우측
여백과 900px 접힘 브레이크포인트가 변경 전과 동일. `bun run deco:verify` 통과.

### WP3 · `S3` 글 지도 전환 — 960px 흡수

- `src/pages/graph.astro:410`(`.graph-page`) — `960px` → `var(--wide-max)`.
- 같은 파일의 `<BaseLayout>` 호출에 `width="wide"`.

**완료 기준**: `/graph` 에서 셸·콘텐츠 폭이 1100px 로 같다. 그래프 캔버스가 1100px 에서
노드 겹침·클리핑 없이 그려진다(실측). `deco:verify` 통과.

## 2. 의존과 순서

순차다. `S1` → `S2` → `S3`.

- `S2`·`S3` 는 `S1` 의 `--wide-max` 와 `width` prop 이 있어야 성립한다 — 선행 필수.
- `S2` 와 `S3` 사이에는 의존이 없다(파일이 disjoint: `index.astro` / `graph.astro`).
  그럼에도 순차로 두는 이유는 둘 다 완료 기준에 `bun run build` + `deco:verify` 를 갖는데
  같은 워크트리에서 병렬로 돌리면 `dist/` 를 서로 밟기 때문이다(관점 B 를 버린 근거).
- 배치 밖 의존: `S4` 는 `S2`·`S3` 가 **둘 다** 끝나야 성립한다(넓은 판 두 지면의 푸터를
  나란히 재야 한다). 그래서 배치 2 로 뺐다.

## 3. 리스크

- **낮음 — 되돌릴 것은 파일 6개다.** `S1` 이 폴백(`var(--shell-max, var(--content-max))`)을
  갖고 있어, `S1` 만 들어간 상태에서도 읽는 판 8지면은 한 픽셀도 안 움직인다. 배치 중간에
  멈춰도 사이트가 깨지지 않는다.
- **푸터가 넓어지는 것이 유일한 실질 위험이다.** `AuthorLineup` 은 `width:100%` +
  `grid-template-columns: repeat(var(--n), minmax(0,1fr))`(`AuthorLineup.astro:173`·`:176`)
  이라 푸터 720→1100 에서 저자 컷아웃 칸이 벌어진다. **이 배치에서는 고치지 않고 관찰만 한다** —
  판정과 대응은 `S4` 다. `deco:verify` 가 잡으면 그 자리에서 배치 2 를 당긴다.
- **데코 좌표는 안 건드린다.** 홈 컨테이너 폭은 1100px 그대로이고 토큰화만 하므로
  `deco.css` 의 실측 좌표에 입력이 바뀌지 않는다(`deco.css` 에 폭에 걸린 좌표 grep 0건).
- 예산 초과 지점: 없음으로 본다. work 3개 전부 CSS 한 줄~몇 줄 교체 + 빌드 확인이다.

## 4. 착수 시점 판단

**2026-08-24 착수. `S1`·`S2`·`S3` 셋 다 이 배치에서 한다 — 마지막 work 를 다음 배치로 미루지 않는다.**

- **미루지 않는 근거**: `S3` 을 배치 2 로 넘기면 폭의 종류가 720 · 960 · 1100 셋으로 남은 채
  배치가 닫힌다. "폭에 이름을 붙인다"가 이 카드의 목표인데 그 상태는 절반만 선 것이고,
  중간 상태로 커밋이 남으면 다음 세션이 960 을 새 규칙의 일부로 오해할 수 있다.
- **셋의 성격이 같다**: 전부 이미 있는 값을 토큰 참조로 **교체**하는 일이다. 새 CSS 를 만들지
  않으므로 실측 좌표를 다시 잴 일이 없다.
- **`S4` 를 당겨오지 않는다**: `S4` 는 `S2`·`S3` 가 둘 다 끝나야 성립하고, 라인업 상한이
  필요해지면 **새 CSS 를 부르는 일**이라 이 배치의 성격과 다르다. 배치 2 에 그대로 둔다.
- **워크트리**: `/Users/centurio/orca/workspaces/centurio1987.github.io/KAN-068-5KMRV8`
  (브랜치 `KAN-068-5KMRV8`, base `fed67c2`).
