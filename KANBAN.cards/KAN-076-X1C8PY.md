---
card: KAN-076-X1C8PY
title: 게이트 인식층 — 선 굵기 81건에 viewBox 를 아는 판정 규칙을 세운다
created: 2026-08-30
scope: scripts/lib/tokens/**, scripts/verify-tokens.ts, scripts/check-recognize-invariant.ts, scripts/fixtures/tokens/**, scripts/tokens-baseline.json, design-concept/UI_CONSISTENCY_AUDIT.md, design-concept/DESIGN_CONCEPT.md
---

# KAN-076-X1C8PY — 게이트 인식층 — 선 굵기 81건에 viewBox 를 아는 판정 규칙을 세운다

## 전략
### 카드가 적은 갈림선이 실측과 안 맞는다 — 먼저 이것부터

카드 메모와 감사 정본 §6-12 는 「**viewBox 유무가 갈림선**」이라고 적었다. 실측하면
그 선으로는 아무것도 안 갈린다.

`src/**` 의 게이트 스캔 범위(`.astro`·`.tsx`·`.css`) 안 `stroke-width` 자리는 **50** 이고
(svg 속성 39 · CSS 선언 5 · JSX 표현식 4 · style 객체 2), **전부 viewBox 를 가진 SVG
좌표계 안에 있다. viewBox 없는 SVG 는 0개다.** 그리고 **배율이 1 인 자리도 0개다**:

| 자리 | viewBox | 렌더 크기 | 배율 | 예시 값 → 화면 px |
|---|---|---|---|---|
| `motifs/Mascot.astro` (11) | 168×152 | `size` 기본 96 | 0.571 | `2.4` → 1.37px |
| `motifs/Sparkle.astro` (1) | 28×28 | `size` 기본 22 | 0.786 | `1.3` → 1.02px |
| `FeedLink.astro` (1) | 16×16 | 13×13 고정 | 0.8125 | `2.1` → 1.71px |
| `viz/VizNote.tsx` (1) | 96×72 | 72×54 고정 | 0.75 | `2.6` → 1.95px |
| `deco/Doodle.astro` (21) | 열 종류 | `width` prop | **호출자마다 다름** | `9` → 5.23px 또는 9px |
| `motifs/Squiggle.astro` (1) | 540×12 | `width="100%"` | 유동 | — |
| `deco/Twine.astro` (2) · `PhotoFrame.astro` (2) | 190×70 · 196×156 | prop | 유동 | — |
| `graph/GraphExplorer.tsx` (7) | 900×640 | CSS `width:100%;height:auto` | 유동 | — |
| `lib/viz/PosterHero.tsx` (1) | 600×338 | 래스터 1200×676 | 2.0 | `2` → 4px |

카드가 든 예시 **둘 다 틀렸다.**

- 「`Doodle.astro:437` 의 `stroke-width="9"` 는 화면 px 로 1~2px」 → 실제로는
  `HeroCollage.astro:144` 가 `width={50}` 을 넘겨 **5.23px**, `/design/deco` 카탈로그는
  width 를 안 넘겨 기본 86 이라 **9px** 이다.
- 「`GraphExplorer.tsx:1308` 은 안 스케일되는 인라인 SVG 라 1단위 = 1px」 → 그 `<svg>` 는
  `viewBox={\`0 0 ${W} ${H}\`}`(900×640, `GraphExplorer.tsx:1179`)에 CSS
  `width: 100%; height: auto`(같은 파일 1395)라 **컨테이너 폭을 따라 스케일된다.**

카드가 적은 81 도 이 범위의 수가 아니다. 범위 밖 `.ts` 35건(`doodleMarks.ts` 33 ·
`viz/schema.ts` 1 · `blogVizStyleGuide.ts` 1)을 섞은 수이고, `.ts` 가 스캔 범위 밖인 것은
감사 §6-1 이 이미 적어 둔 사실이다.

### 그래서 갈림선을 다시 쓴다 — 「이 길이의 단위가 CSS px 인가」

`--stroke-hair/--stroke/--stroke-bold` 3단은 **CSS px 자**다(`DESIGN_CONCEPT.md` §8).
SVG 좌표계 안의 `stroke-width` 는 **사용자 단위**이고, px 로 환산하려면 배율이 필요한데
그 배율은 **호출자가 정한다** — `<Mascot size={40}/>` 면 0.238 이고 `<Doodle width={50}/>` 면
0.581 이다. **같은 소스 한 줄이 지면마다 다른 px 로 그려진다.** 정적 게이트가 알 수 있는
값이 아니다.

그러므로 판정은 둘로 갈린다.

- **SVG 사용자 단위 자리** → `판정 불가`. 사유에 좌표계를 함께 적는다
  (`viewBox 0 0 86 74 · 배율은 호출자가 정한다`). 위반이 아니다 — 고칠 방법이 없는 것을
  무는 게이트는 우회당하거나 예외로 덮인다.
- **CSS px 자리**(viewBox 없는 SVG, 또는 viewBox 치수와 고정 width/height 가 같은 SVG)
  → 기존 `stroke` 축 판정 그대로 `--stroke*` 와 대조한다. **지금 레포에 0건이다.**

버린 대안 둘.

- **정적으로 아는 배율만 환산해 판정한다.** `FeedLink` 2.1×0.8125 = 1.71px 처럼 토큰에
  없는 값이 나오는데, SVG 안에서는 `var(--stroke)` 를 써도 `1.5px` 가 px 가 아니라
  **사용자 단위 1.5** 로 읽혀 화면에서는 1.22px 가 된다. 게이트가 무는데 고칠 길이 없다.
- **SVG 전용 굵기 스케일을 세운다.** 실측 값 분포가 `1 · 1.3 · 1.4 · 1.6 · 1.8 · 2 · 2.1 ·
  2.2 · 2.4 · 2.6 · 3 · 3.2 · 3.4 · 3.5 · 3.6 · 4 · 4.5 · 7 · 8 · 9 · 10` 로 눈금이 아니라
  연속 스펙트럼이고, viewBox 배율이 제각각이라 정규화해도 모이지 않는다. 눈금을 세울
  근거가 없다.

### 이 카드의 값은 부채 발굴이 아니라 **구멍 막기**다

지금 `stroke-width` 는 위반도 준수도 판정 불가도 아니다 — **판정에 아예 안 들어온다**
(`propAxis.ts` 의 `AXIS` 표에 속성이 없다). 래칫이 0 일 때 그 0 이 「닫혔다」와 「안 보인다」를
섞고 있고, 이 카드가 그중 한 갈래를 걷어낸다. 감사 §6-10(`.astro` 인라인 `style` 속성)이
「값은 부채 발굴이 아니라 구멍 막기다」로 처리된 것과 같은 모양이고, 그때도 부채 증분은
거의 0 이었다.

### 어떻게 붙이나 — 다섯째 인식기

KAN-073·KAN-075 가 세운 규약 그대로다. **옛 정규식(`DECL`·`ATTR`·`JSXOBJ`)도 `AXIS` 표도
한 글자 안 고친다** — 고치면 감사 원자료 3,539 히트와의 대조가 깨지고, 그 붕괴는 빌드도
타입도 게이트도 초록인 채로 일어난다.

- `scripts/lib/tokens/recognize/svgStroke.ts` 를 다섯째 인식기로 붙인다(`src` 라벨 `svg-stroke`).
  네 형태(svg 속성 · CSS 선언 · JSX 표현식 · style 객체)를 잡고, **감싸는 `<svg>` 의
  좌표계를 판별해 단위를 붙인다.**
- 추출 축 `Axis` 에 `"stroke"` 를 더한다. 옛 경로는 `AXIS` 표에 `stroke-width` 가 없어
  이 축을 **영영 못 낸다** — 그래서 옛 집합이 안 움직인다.
- `extract.ts` 의 `classify()` 는 맨 숫자를 버리는 필터가 있어(`stroke-width="9"` 가 여기서
  죽는다) `stroke` 축 한 줄을 예외로 연다. 옛 경로가 `stroke` 축을 못 내므로 옛 히트는
  안 움직이고, 그 사실을 `tokens:invariant` 가 증명한다.
- 판정은 `color.ts` 가 진다(이미 `stroke` 판정 축을 갖고 있다). 단위가 px 면 기존 경로,
  사용자 단위면 `판정 불가`.

### 무엇을 안 하나

- **`.ts` 를 스캔 범위에 넣지 않는다.** `doodleMarks.ts` 33건이 거기 있지만 범위 확장은
  이 카드가 아니라 감사 §6-1 이 소유한 별건이고, 넣으면 `.ts` 전체(28파일)가 한꺼번에
  판정에 들어와 이 카드의 증분이 안 읽힌다.
- **값을 하나도 안 고친다.** 판정 불가로 들어오는 자리는 고칠 대상이 아니다. 화면은
  한 픽셀도 안 바뀌므로 `render:compare` 는 필요 없다(고친 값이 0 이면 대조할 것이 없다).
- **하드월 승격을 안 한다.** 남은 인식 갈래가 KAN-077(상수 승격) 하나 더 있다.

### KAN-077 과 같은 자리를 건드린다

둘 다 `scripts/lib/tokens/**` 이다. **병렬로 돌리면 안 된다** — 인식층을 넓히는 커밋은
기준선을 같은 커밋에서 갱신해야 하는데(나누면 그 사이 푸시에서 배포가 멈춘다) 두 카드가
동시에 그 파일을 쓰면 기준선이 서로를 덮는다. KAN-077 에 `scope` 가 붙는 시점에
`dep-serialize` 로 **이 카드를 선행**으로 박는 것이 맞다. 지금은 077 이 미착수라 게이트가
안 걸리므로 여기 기록만 남긴다.

## 실행 계획
work 는 `S<n>` 하나가 단위다. 완료 기준을 각 단계에 달았다.

- [x] `S1` 실측을 레포에 굳힌다 — `stroke-width` 자리 전수와 좌표계
      완료 기준: 스캔 범위 안 50자리마다 `(파일, 줄, 형태, 값, viewBox, 렌더 크기, 배율)`
      이 나오고, **배율 1 인 자리가 0 · viewBox 없는 SVG 가 0** 임이 출력으로 확인된다.
      범위 밖 `.ts` 35건은 따로 세어 「이 카드 밖」으로 적는다.

- [x] `S2` 다섯째 인식기 `recognize/svgStroke.ts` — 네 형태를 잡고 좌표계를 붙인다
      완료 기준: `stroke-width="9"`(svg 속성) · `stroke-width: 4px`(CSS) ·
      `strokeWidth={2}`(JSX 표현식) · `strokeWidth: 2.6`(style 객체) 넷이 전부 히트로
      나오고, 각 히트가 감싸는 `<svg>` 의 좌표계를 들고 있다. **`<svg>` 태그보다 위에
      선언된 style 객체**(`VizNote.tsx:47`)와 **패키지 컴포넌트가 SVG 를 그리는 자리**
      (`PosterHero.tsx:124` 의 `<Canvas viewBox=…>`)에서 좌표계를 못 찾으면 「미상」으로
      내고 사용자 단위로 다룬다 — 못 찾은 것을 px 로 넘기면 가짜 위반이 된다.

- [x] `S3` 판정 — `Axis` 에 `stroke` 를 더하고 `color.ts` 가 단위별로 가른다
      완료 기준: 사용자 단위 자리는 `판정 불가` + 사유에 viewBox 가 적히고, px 자리는
      기존 `stroke` 판정(`--stroke*` 대조)을 그대로 탄다. `bun run tokens:verify` 가
      `stroke / 판정 불가 50` 을 내고 **위반·드리프트 증분 0**.

- [x] `S4` 자가검사 — `svgStroke.faults` 와 고장 픽스처
      완료 기준: 고장 둘이 각자 다른 `(판정, 사유, 인식 경로)` 로 걸린다. ① px 자리
      (viewBox 없는 SVG)의 토큰 밖 굵기 → `위반 / stroke 축 / svg-stroke`,
      ② 사용자 단위 자리가 **인식은 되는지** — 인식기가 죽으면 판정이 0 건이 되고
      래칫은 그것을 「줄었다」로 읽는다. `bun run tokens:verify` 의 자가검사 줄이
      고장 12종·사유 12가지로 늘어난다.

- [x] `S5` 불변 증명 + 기준선 갱신 — **같은 커밋에서**
      완료 기준: `bun run tokens:invariant -- --before <기준 커밋 스냅샷> --self-test` 가
      옛 히트 증분 0 · 새·옛 인식 경로 겹침 0 · 겹침 가드 자가검사 통과로 끝난다.
      `--update-baseline` 으로 갱신한 `scripts/tokens-baseline.json` 이 같은 커밋에 든다
      (나누면 그 사이 푸시에서 CI 가 빨개져 배포가 멈춘다).

- [x] `S6` 문서 — 갈림선을 코드 밖에도 적는다
      완료 기준: ① 감사 정본 §6-12 에 **정정 블록**(KAN-075 가 §6-11 에 단 것과 같은
      형식) — viewBox 유무가 갈림선이 아니라는 것, 두 예시가 틀렸다는 것, 실측 50/35.
      ② `DESIGN_CONCEPT.md` §8 선 굵기 절에 「SVG 사용자 단위는 이 3단의 관할 밖」 한 문단.
      ③ `CLAUDE.md` 의 인식층 문단을 넷째 → 다섯째로 갱신하고 남은 갈래를 하나(KAN-077)로.

- [x] `S7` px 자리 부채 처분
      완료 기준: S3 이후 `stroke` 축에서 무는 판정(위반·드리프트)이 실제로 있으면
      토큰으로 바꾸거나 근거를 걸어 예외 등록한다. **실측 예상은 0건**이므로 0 이면
      「0 임을 확인했다」를 수행 내역에 남기고 닫는다.

## 검증
착수한 쪽이 **먼저 돌리고 결과를 검토서에 싣는다.** 검토자에게 다시 시키지 않는다.

| # | 명령 | 통과 기준 |
|---|---|---|
| 1 | `bun run tokens:verify` | 종료 0. `stroke / 판정 불가` 가 새로 서고 **위반·드리프트 증분 0**. 자가검사 줄이 고장 12종·사유 12가지 |
| 2 | `bun run tokens:invariant -- --before <기준 커밋 스냅샷> --self-test` | 종료 0. 옛 히트 증분 **0** · 새·옛 인식 경로 겹침 **0** · 겹침 가드 자가검사 통과 |
| 3 | `bun run build` | 종료 0. 게이트를 고쳤지 `src/**` 를 안 고쳤으므로 회귀가 나오면 그것이 곧 반려 사유다 |
| 4 | `git diff --stat -- src/` | **빈 출력.** 이 카드는 값을 하나도 안 고친다 — `src/` 가 바뀌었으면 범위를 넘은 것이다 |
| 5 | 인식기 죽이기 | `RECOGNIZERS` 에서 `svgStroke` 를 빼면 `tokens:verify` 자가검사가 **빨개져야 한다**. 안 빨개지면 그 고장은 있어 보이기만 하는 검사다(KAN-075 가 가드 하나를 그렇게 지웠다) |

기준 커밋 스냅샷 뜨는 법(2번):

```
git stash && bun scripts/verify-tokens.ts --json --no-self-test > /tmp/kan076-before.json && git stash pop
```

**`render:compare` 는 안 돌린다.** 그 하네스는 「값을 바꿨는데 화면이 안 바뀌었음」을 증명하는
것이고, 이 카드는 값을 하나도 안 바꾼다(검증 4번이 그것을 판정한다). S7 에서 실제로 값을
고치게 되면 그때 이 표에 한 줄을 더한다.

## 수행 내역
<!-- KANBAN:LOG append-only — 아래로만 덧붙인다. 위를 고치지 않는다. -->
- 2026-08-30T13:10 · s:c6a8fb52 — `전략` 섹션 교체
- 2026-08-30T13:11 · s:c6a8fb52 — `실행 계획` 섹션 교체
- 2026-08-30T13:11 · s:c6a8fb52 — `검증` 섹션 교체
- 2026-08-30T13:17 · s:c6a8fb52 · S1 doing — 착수
- 2026-08-30T13:17 · s:c6a8fb52 · S1 done — 실측 고정 — 스캔 범위 안 50자리(svg속성 39·CSS선언 5·JSX표현식 4·style객체 2), viewBox 없는 SVG 0개, 정적 배율 1인 자리 0개, 범위 밖 .ts 35건. 좌표계 못 찾는 자리 4 = VizNote.tsx:47(객체가 svg 위에 선언) · PosterHero.tsx:124(<Canvas>가 svg를 그린다) · viz.css 2(CSS 파일이라 svg 태그가 없다). 별도 survey 스크립트를 레포에 안 남긴다 — viewBox 판별이 두 벌이 되어 인식기와 갈린다. 재현은 S2 이후 tokens:verify --json 의 src=svg-stroke 로 한다
- 2026-08-30T13:19 · s:c6a8fb52 · S2 doing — 착수
- 2026-08-30T13:24 · s:c6a8fb52 · S2 done — 다섯째 인식기 recognize/svgStroke.ts (src=svg-stroke). 네 형태 전부 인식 — 50자리 → 히트 51(GraphExplorer:1265 의 {1 + 2.4 * l.strength} 가 리터럴 둘). 좌표계 판별 규칙 넷(감싸는 svg 없음 → 사용자 단위 / viewBox 없음 → CSS px / viewBox 치수 == 고정 width·height → CSS px 배율1 / 그 외 → 사용자 단위). AXIS 표·옛 정규식 무수정, classify() 도 무수정(맨 숫자 pxify 승격으로 필터를 안 만난다). 실측 정정: 카드가 적은 '정적 배율 1인 자리 0개' 가 틀렸다 — Doodle.astro:373(34x26)·391(28x28) 두 SVG 가 width/height 를 viewBox 치수 그대로 박아 진짜 1:1 이고 CSS 재조정도 없다
- 2026-08-30T13:24 · s:c6a8fb52 · S3 doing — 착수
- 2026-08-30T13:25 · s:c6a8fb52 · S3 done — color.ts 가 stroke 축을 받고 단위를 드리프트 검사보다 먼저 본다. 결과: stroke / 판정 불가 49 · 위반 2 (Doodle.astro:373·391 의 stroke-width=3.2 — 배율 1 이라 진짜 3.2 CSS px 이고 3단 1/1.5/2px 밖). 순서가 규칙인 근거를 실측으로 확인: PosterHero:124 strokeWidth:2 와 GraphExplorer:1308 {2} 는 --stroke-bold(2px) 와 값이 같아 순서를 뒤집으면 드리프트로 잡히는데 화면에서는 각각 4px·유동이다
- 2026-08-30T13:25 · s:c6a8fb52 · S4 doing — 착수
- 2026-08-30T13:26 · s:c6a8fb52 · S4 done — 고장 픽스처 svg-stroke.astro (고장 둘: viewBox 없는 SVG 의 7 → 위반 / viewBox 있는 SVG 의 9 → 판정 불가). 자가검사 10종·10사유 → 12종·12사유. 죽여서 확인 3회: ①scan 을 빈 배열로 → 고장 둘 다 빨개짐 ②좌표계 미상을 css-px 로 뒤집음 → 사용자 단위 고장만 빨개짐(순서 규칙이 실제로 무는 것을 확인) ③RECOGNIZERS 에서 제거 → 빨개지지 않고 고장 수만 12→10 으로 줄었다. ③은 인식기가 자기 고장을 소유하는 구조의 성질이라 다섯 인식기 모두에 해당한다(이 카드가 만든 것이 아니다) — 검토 판단 항목으로 올린다
- 2026-08-30T13:26 · s:c6a8fb52 · S5 doing — 착수
- 2026-08-30T13:27 · s:c6a8fb52 · S5 done — tokens:invariant --before <착수 직전 스냅샷> --self-test 통과 — ①옛 판정 4790건이 열 필드 키로 그대로 ②새 판정 51건과 옛 히트의 (file,line,value) 교집합 0 ③겹침 가드 자가검사 통과. 기준선 갱신: 위반 0→2 · 판정 불가 1083→1130(+47, svg-user 49 중 viz.css 2 는 제외분) · 준수 3639 불변. build 통과 · git diff --stat -- src/ 빈 출력
- 2026-08-30T13:27 · s:c6a8fb52 · S7 doing — 착수
- 2026-08-30T13:28 · s:c6a8fb52 · S7 done — 부채 2건 처분 — 원래 0 이 아니었다. Doodle.astro:373·391 의 stroke-width=3.2 는 배율 1(34x26·28x28 이 viewBox 치수 그대로)이라 진짜 CSS px 이고 3단 밖이다. 값을 안 고치고 자리 단위 예외 doodle-crayon-stroke 로 등록했다(site: axis==stroke && value==3.2px — 파일 단위로 걸면 같은 파일의 색 준수분과 사용자 단위 49자리까지 판정에서 내려간다). 근거는 DESIGN_CONCEPT.md:402 에 이 카드가 새로 적은 절이고, 게이트의 예외 표 자가검사가 그 줄의 존재를 매 실행 확인한다. 래칫 위반 2 → 0
- 2026-08-30T13:30 · s:c6a8fb52 · S6 doing — 착수
- 2026-08-30T13:30 · s:c6a8fb52 · S6 done — 문서 셋 — ①UI_CONSISTENCY_AUDIT.md §6-12 에 정정 블록(갈림선·예시 둘·건수 셋을 다 정정하고, '전부 가짜 위반' 이 절반만 맞았음을 49 대 2 로 적었다) ②DESIGN_CONCEPT.md §8 에 두 문단(3단은 CSS px 자다 / 예외는 배율 1 로 굳은 SVG 다 — 예외 doodle-crayon-stroke 의 근거가 402줄이다) ③CLAUDE.md 를 다섯째 갈래까지로 갱신하고 남은 갈래를 둘→하나(KAN-077)로, §6 의 12·13항을 13항으로 고쳤다. 세 문서가 같은 수(51·49·2)를 쓴다
