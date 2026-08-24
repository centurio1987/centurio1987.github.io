# S2 산출 — 축 A 선언 층 진단 (KAN-069-M724GH)

판정 방법: 추측이 아니라 **런타임 필드 유무**로 확정했다.
추출기 `s2-declared-layers.ts`(bun 으로 두 스타일 가이드를 실제 로드해 필드를 찍는다),
원자료는 그 출력. 드리프트는 `s2-drift.py`(주석 짝) + `s2-drift2.py`(색 리터럴 전량).

## 1. 블로그가 선언한 스타일 가이드는 둘이고, 인터페이스가 서로 다르다

| 선언 | 타입 | 정의 |
|---|---|---|
| `bbangtoTonyStyleGuide` | `StyleGuide` (core 1.1.1) | `src/lib/motion/bbangtoTonyStyleGuide.ts:138` |
| `blogVizStyleGuide` | `VisualizationStyleGuide` (visualization 0.2.0) | `src/lib/viz/blogVizStyleGuide.ts:85` |

`VisualizationStyleGuide` 는 `StyleGuide` 의 미러다 — 같은 층 이름을 쓰되 wrapper 대상이
headless 시각화 컴포넌트다(`visualization/dist/index.d.ts:35-45`). 따라서 층별로 나란히 잰다.

## 2. 층별 판정표 (S2 완료 기준 (a))

`ABSENT` = 그 필드가 객체에 아예 없다(옵셔널 미선언). 두 객체의 실제 own key 는 **`name` ·
`description` · `foundations` 셋뿐**이다.

| 층(필드) | `bbangtoTonyStyleGuide` | `blogVizStyleGuide` | 카탈로그 51종 기준선 |
|---|:---:|:---:|:---:|
| `name` | 구현 `"bbangto-tony"` | 구현 `"ppangkwan-tony"` | 51/51 |
| `description` | 구현 | 구현 | 51/51 |
| `foundations` (필수) | **구현** (10키) | **구현** (12키) | 51/51 |
| `extendedFoundations` | **없음** | **없음** | 51/51 (종당 2~10) |
| `foundationPresets` | **없음** | **없음** | 51/51 (종당 3) |
| `defaultFoundationKey` | **없음** | **없음** | — |
| `guidelines` | **없음** | **없음** | 51/51 (종당 3~4) |
| `wrapperComponents` | **없음** | **없음** | 51/51 (종당 3) |
| `patterns` | **없음** | **없음** | 51/51 (종당 1) |
| `visualMotif` | **없음** | **없음** | 51/51 (spec 3 + example 1) |
| `meta` | **없음** | **없음** | 51/51 |
| `wrapperBlocks` · `wrapperPatterns` | 없음 | (그 필드 자체가 없는 인터페이스) | **0/51 — 해당 없음** |

**축 A 판정: 필수 층 하나(`foundations`)만 서 있고, 선택 층은 두 선언 모두 전량 미구현이다.**
`wrapperBlocks`·`wrapperPatterns` 는 카탈로그 51종도 0/51 이라 감점 대상이 아니다(S1 §4).

**근거로 못 박은 원인**: `bbangtoTonyStyleGuide` 는
`foundationToStyleGuide(bbangtoTonyFoundation)` 한 줄로 만든다
(`src/lib/motion/bbangtoTonyStyleGuide.ts:138-139`). 이 헬퍼의 문서화된 용도가
"**foundations-only StyleGuide 로 변환**"(`core/dist/index.d.ts:80-83`)이므로 나머지 층이 빠진 것은
누락이 아니라 **그 헬퍼의 정의된 동작**이다. `blogVizStyleGuide` 쪽은 헬퍼를 안 쓰고 객체
리터럴을 직접 쓰는데, 그 리터럴이 세 필드만 담는다(`blogVizStyleGuide.ts:85-89`).

## 3. 선언이 실제로 주입되는가 — 축 A 가 낳은 별건

층 판정과 별개로, 전수 grep 이 하나를 더 잡았다.

- **`bbangtoTonyStyleGuide` 는 어디에서도 소비되지 않는다.** `src/`·`scripts/` 전수 검색에서
  `StyleGuideProvider`(core) 사용처가 **0건**이고, 이 상수를 import 하는 곳도 없다. 실제로
  쓰이는 것은 자매 export `bbangtoTonyFoundation` 하나이며, 소비자도 하나다 —
  빌드 타임 생성기 `scripts/gen-motion-css.ts:23,40` 이 `src/styles/motion.css` 를 굽는다.
  즉 이 파일은 **StyleGuide 로서가 아니라 모션 토큰 소스로** 살아 있다.
  파일 주석이 예고한 "아일랜드용 StyleGuideProvider(Phase C)"(같은 파일 5행)는 안 들어왔다.
- **`blogVizStyleGuide` 는 주입된다.** `src/components/viz/VizFigure.tsx:21,116,128` 이
  `VisualizationStyleGuideProvider` 로 감싼다(모든 viz 그림의 공통 프레임).

## 4. 값 드리프트 대조 (S2 완료 기준 (b))

`tokens.css` 는 44개 커스텀 프로퍼티를 선언한다. TS 두 파일이 그 값을 다시 적는다.

### 4-1. 주석으로 짝이 명시된 리터럴 34개

| 결과 | 건수 |
|---|---:|
| 일치 | **31** |
| **불일치** | **3** |
| 대소문자만 다름 | 0 |
| 가리킨 토큰이 CSS 에 없음 | 0 |

불일치 3건 — (토큰명, CSS 값, TS 값):

| 토큰 | CSS 값 | TS 값 | 자리 |
|---|---|---|---|
| `--btn-radius` | `999px` | `9999px` | `tokens.css:38` ↔ `bbangtoTonyStyleGuide.ts:101` |
| `--font-body` | `'Gowun Dodum', sans-serif` | `'Gowun Dodum', system-ui, sans-serif` | `tokens.css:62` ↔ `…:93` |
| `--font-mono` | `'Space Mono', monospace` | `'Space Mono', 'JetBrains Mono', monospace` | `tokens.css:63` ↔ `…:94` |

셋 다 **렌더 결과가 갈릴 수 있는 실질 차이**다(폴백 폰트 스택이 다르고, radius 는 값 자체가
다르다). 다만 `bbangtoTonyStyleGuide` 가 현재 아무 지면에도 주입되지 않으므로(§3) **지금 화면에
보이는 차이는 아니다** — 주입되는 순간 갈라진다.

### 4-2. 주석 없이 같은 값을 다시 적은 색 리터럴 — 조용한 중복 8건

`blogVizStyleGuide.ts:27-34` 의 역할 팔레트 8색이 전부 `tokens.css` 값과 같은데 **어느 토큰에서
왔는지 주석이 없다**(주석은 `// 핵심 흐름 / 아키텍처` 같은 용도 설명이다). 대문자 표기라 문자열
비교로는 안 걸리고, 값이 바뀌면 아무도 못 알아챈다.

| TS 자리 | 값 | 같은 값의 CSS 토큰 |
|---|---|---|
| `blogVizStyleGuide.ts:27` | `#4E6CA8` | `--cat-architecture` (`#4e6ca8`) |
| `:28` | `#D8A33F` | `--pop` (`#d8a33f`) |
| `:29` | `#A84B4B` | `--cat-strategy` |
| `:30` | `#3E6B4F` | `--cat-planning` |
| `:31` | `#3E6B6B` | `--cat-skills` |
| `:32` | `#7A5C7E` | `--cat-design` |
| `:33` | `#6B6B3E` | `--cat-quality` |
| `:34` | `#B07A2E` | `--cat-research` |

8건 모두 **대소문자만 다르고 값은 같다** — 지금은 드리프트가 아니라 **드리프트 예비군**이다.

### 4-3. CSS 짝이 없는 TS 고유값 3건 (드리프트 아님)

`bbangtoTonyStyleGuide.ts:50` `#2434b5`(accent hover) · `:51` `#1d2a92`(accent active) ·
`:83` `#ffffff`(primaryFg). 앞의 둘은 파일 주석이 "블로그가 별도 정의하지 않아 여기서 살짝
어둡게"라고 사유를 적어 뒀다(`:49`).

### 4-4. 이 대조가 안 본 것

- **`tokens.css` → TS 방향의 미복제**: TS 가 안 옮긴 CSS 토큰 10개는 대조 대상이 아니다.
- **비색 리터럴의 조용한 중복**: 4-2 는 `#RRGGBB` 만 훑는다. `1.6`(strokeWidth) 같은 수치나
  `rgba(...)` 표기는 짝짓지 않았다.
- **`motion.css` 는 대조하지 않는다** — 생성물이고 방향이 반대다(TS → CSS,
  `gen-motion-css.ts`). 여기서는 TS 가 정본이라 중복이 아니다.
