# S3 산출 — 축 B 구현 층 전수 스캔 (KAN-069-M724GH)

추출기 `s3-scan.py`, 원자료 `s3-scan.json` (스크래치패드).
**재현 확인**: 같은 워크트리에서 재실행해 출력 JSON 이 바이트 단위로 같다
(`sha256 76ec13fdc5f0…`, 총계 3,539 / token 858 / literal_dup 47 / literal_new 2,634).

## 1. 스캔 대상

`src/**` 의 `.astro` 59 · `.tsx` 88 · `.css` 6 중 **정본 자신(`src/styles/tokens.css`)을 뺀 152개**.
(카드 전략의 "147개"는 착수 전 어림이고, 실측은 153-1=152다.)

읽은 자리 셋:

| 자리 | 무엇 | 대상 |
|---|---|---|
| A. CSS 선언 | `prop: value;` | `.css` 전체 · `.astro` 의 `<style>` 블록 · `.tsx` 의 템플릿 리터럴 |
| B. JSX/SVG 속성 | `fill="…"` `stroke="…"` `stopColor="…"` | `.astro` · `.tsx` |
| C. 인라인 style 객체 | `{ background: "…", padding: "…" }` | `.astro` · `.tsx` |

축 6개(색 · 간격 · radius · shadow · 폰트 · z-index)에 속하는 property 만 본다.

## 2. 분류 세 갈래 — 판정이 아니라 분류다

| 갈래 | 뜻 |
|---|---|
| `token` | `var(--x)` 로 토큰을 썼다 |
| `literal_dup` | 리터럴인데 **같은 축의 토큰에 그 값이 이미 있다** |
| `literal_new` | 리터럴이고 `tokens.css` 에 그 값이 없다 |

**축이 다른 값 일치는 `dup` 으로 세지 않는다.** `padding: 8px` 이 `--radius-sm: 8px` 와 같은 것은
우연이지 드리프트가 아니다. 축 필터를 넣기 전 1차 집계는 `dup` 이 479건이었고, 넣은 뒤 **47건**이다.

## 3. 총계

| | 건수 |
|---|---:|
| 총 히트 | **3,539** |
| `token` | **858** (24.2%) |
| `literal_dup` | **47** |
| `literal_new` | **2,634** |

축별:

| 축 | token | literal_dup | literal_new |
|---|---:|---:|---:|
| color | 579 | 23 | 587 |
| spacing | 96 | 0 | 1,350 |
| font | 143 | 0 | 478 |
| shadow | 14 | 0 | 135 |
| radius | 26 | 24 | 67 |
| z-index | 0 | 0 | 17 |

## 4. 구획별 — 어디가 토큰을 쓰고 어디가 안 쓰는가

| 구획 | 파일 | token | lit_dup | lit_new | 토큰율 |
|---|---:|---:|---:|---:|---:|
| A. 글 안 React 시뮬 (`src/components/posts/**`) | 35 | 15 | 17 | 786 | **1.8%** |
| B. 데코 키트 (`components/deco/**` · `deco.css`) | 22 | 197 | 3 | 507 | 27.9% |
| C. viz 프레임 (`lib/viz` · `components/viz` · `viz-frame.css`) | 4 | 28 | 0 | 109 | 20.4% |
| D. 손그림 모티프 (`components/motifs/**`) | 3 | 3 | 6 | 29 | 7.9% |
| E. 디자인 카탈로그 (`pages/design/**`, noindex) | 3 | 163 | 5 | 432 | 27.2% |
| F. 전역 스타일 (`src/styles/**`) | 3 | 25 | 0 | 48 | 34.2% |
| G. 레이아웃 (`src/layouts/**`) | 2 | 61 | 1 | 128 | 32.1% |
| H. 공용 셸·컴포넌트·페이지 | 23 | 366 | 15 | 595 | **37.5%** |
| **합계** | **95** | **858** | **47** | **2,634** | 24.2% |

(히트가 하나라도 있는 파일이 95개다. 나머지 57개는 시각 값을 안 쓴다.)

**A 구획이 사실상 별도 팔레트다.** 토큰율 1.8%이고, 상위 파일 여럿이 토큰 사용 **0건**이다
(`osi-7-layers-2/SwitchLearningLab.tsx` · `webrtc-1/LoopbackNegotiationDemo.tsx` ·
`osi-7-layers-3/RoutingTableLab.tsx` · `osi-7-layers-3/HopJourney.tsx`).
그 자리에서 반복되는 색은 `tokens.css` 에 없는 값들이다 — `#6b6357`(61) · `#302d28`(59) ·
`#fffdf8`(40) · `#c9c1b1`(35) · `#d7d0c2`(24) · `#fbf8f1`(22) · `#4a463f`(11) · `#fffcf6`(10).

## 5. `literal_dup` 47건 — 토큰이 있는데 값을 다시 적은 자리

**radius 24건**이 가장 굵고, 그중 `999px`(=`--btn-radius`)만 **12건**이다.

| 값 | 토큰 | 건수 | 대표 자리 |
|---|---|---:|---|
| `999px` | `--btn-radius` | 12 | `CategoryBadge.astro:29` · `FeedLink.astro:48` · `PostFilter.astro:301,339` · `RelatedPosts.astro:117` · `deco/Sticker.astro:367` · `graph/GraphExplorer.tsx:1614,1633,1684,1708` · `pages/design/deco.astro:805` · `frame-picks.astro:386` |
| `14px` | `--card-radius` | 4 | `PostNav.astro:70` · `GraphExplorer.tsx:1445,1563` · `TalkLayout.astro:303` |
| `8px` | `--radius-sm` | 4 | `deco/Clip.astro:66`(2) · `GraphExplorer.tsx:1846` · `design/deco.astro:939` |
| `12px` | `--radius-md` | 3 | `SeriesEpisodes.astro:87` · `design/deco.astro:715,1033` |
| `16px` | `--radius-lg` | 1 | `AuthorProfile.astro:202` |

**color 23건** — 카테고리색·`--pop`·`--border`·`--ink` 를 리터럴로 다시 적은 자리.

| 값 | 토큰 | 건수 | 자리 |
|---|---|---:|---|
| `#3E6B4F` | `--cat-planning` | 5 | `motifs/Mascot.astro:104-108` |
| `#3e6b6b` | `--cat-skills` | 6 | `AuthzMap.tsx:21` · `LayerTriage.tsx:126,146` · `LoopbackNegotiationDemo.tsx:241,291` · `SdpNegotiationStepper.tsx:125` |
| `#A84B4B` | `--cat-strategy` | 4 | `AuthzMap.tsx:22` · `IceTraversalLab.tsx:167` · `LoopbackNegotiationDemo.tsx:195` · `JitterBufferLab.tsx:173` |
| `#d8d0be` | `--border` | 3 | `OverlayLab.tsx:33` · `DigestChain.tsx:51` · `CriCallTrace.tsx:80` |
| `#4E6CA8` | `--cat-architecture` | 2 | `AuthzMap.tsx:23` · `JitterBufferLab.tsx:112` |
| `#D8A33F` | `--pop` | 2 | `motifs/Mascot.astro:68` · `LoopbackNegotiationDemo.tsx:221` |
| `#20264a` | `--ink` | 1 | `ObserverView.tsx:144` |

전건 목록은 `s3-scan.json` 의 `rows` 에서 `kind == "literal_dup"` 으로 뽑는다.

## 6. 대조할 토큰이 아예 없는 축 둘

- **간격**: `literal_new` 1,350건인데 `tokens.css` 의 간격 토큰은 6개뿐이고
  (`--stroke` · `--measure` · `--content-max` · `--wide-max` · `--page-pad` · `--header-h`)
  그중 **간격 스케일은 하나도 없다**. 즉 이 1,350건은 "토큰을 안 썼다"가 아니라
  **쓸 토큰이 없다**. 같은 이유로 `font-size` · `font-weight` · `line-height`(font 축 478건)와
  `box-shadow`(shadow 축 135건), `z-index`(17건 전량)도 대조 상대가 없다.
- **z-index 17건**은 값이 `1` `2` `3` `9` `10` `999` 로 흩어져 있다
  (`Footer.astro:65` · `Header.astro:32` · `NavProgress.astro:18` · `PostToc.astro:91` ·
  `PostList.astro:263` · `deco/Sticker.astro:203` · `deco/patterns/*` 5건 ·
  `GraphExplorer.tsx:1419,1830` · `index.astro:173,185` · `viz-frame.css:190,478`).

## 7. 이 스캔이 **안 본** 것 — 리스크 문서화

1. **이름 색**(`red` `white` `transparent` `currentColor`)은 안 잡는다. 정규식이
   `#RGB` · `rgb()` · `rgba()` · `hsl()` · `hsla()` 만 본다.
2. **shorthand 가 축을 섞는다.** `border: 1px solid var(--border)` 의 `1px` 가 color 축으로
   들어온다(실측: color 축의 `1px` 110건 · `1.5px` 18건 · `2px` 5건). 색 리터럴 집계를 읽을 때
   `px` 로 끝나는 값은 폭이지 색이 아니다.
3. **`.mdx` 31개와 `.ts` 28개는 대상이 아니다.** 카드 전략이 그은 범위(astro·tsx·css)를 지켰다.
   `.mdx` 본문의 인라인 스타일이 있다면 이 스캔에 안 잡힌다.
4. **`public/**` 의 SVG·이미지 안 색**은 안 본다.
5. **계산값·조건부 값**(`${cond ? "#fff" : "#000"}` 의 바깥 템플릿, `clsx`, CSS `calc()` 안 항)은
   리터럴로만 잡히고 어느 상태에서 쓰이는지는 안 남는다.
6. **`motion.css` 는 생성물**이라 스캔에는 들어가지만, 그 리터럴의 정본은 TS 다(S2 §4-4).
