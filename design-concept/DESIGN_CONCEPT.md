# 디자인 컨셉 & 스타일 가이드 v0.3

> 블로그 정체성: **빵관 토니 — "진지하게 만들고, 즐겁게 쓴다. / Serious Work, Joyful Wit."**
> 레이아웃: **Editorial Split (Frame A)** — 에디토리얼 2분할
> 폰트: **한국어 전용 4종** — Jua · Gowun Dodum · Space Mono · Gaegu
> 상태: **확정(v0.3)** — claude.ai/design 와이어프레임 반영

이 문서의 토큰은 `src/styles/tokens.css`로 구현되어 있다.

다이어그램 전용 규칙은 `design-concept/DIAGRAM_STYLE_GUIDE.md`를 따른다.

---

## 1. 컨셉 한 줄

**"엄밀한 내용, 유쾌한 표면(Rigorous content, playful surface)."**

v0.2(Pretendard 단일 폰트 + earthy palette)에서 v0.3는 한국어 전용 폰트와 Cobalt blue 포인트 컬러로 개성을 강화했다. 여전히 글이 중심이지만, 홈 진입부터 마스코트·손글씨·해치 패턴으로 토니의 성격을 바로 드러낸다.

## 2. 브랜드 성격

명료한 · 대담한 · 유쾌한 · 정돈된 · 따뜻한.

하지 말 것: 차가운 기업 SaaS 톤, 과한 그라데이션·그림자·네온, 본문까지 침범하는 버블/그래피티, 읽기를 방해하는 과도한 텍스처.

## 3. 디자인 원칙

1. 글이 주인공. UI는 액자.
2. 위트는 시스템이다 (손그림·손글씨·색·문구의 일관된 재치).
3. 읽는 표면은 차분하게, 가장자리는 유쾌하게.
4. 색은 아껴서 강하게. Cobalt accent = 링크/CTA/포인트.
5. 모션은 목적이 있을 때만, 0.25초 이내, reduced-motion 존중.

## 4. 색 시스템

### 중립 팔레트

| 토큰 | 값 | 용도 |
|---|---|---|
| `--paper` | `#F3EEE4` | 기본 배경 |
| `--surface` | `#F8F3E8` | 보조 배경 (코드 블록 등) |
| `--cream` | `#EDE6D8` | 카드 배경 |
| `--canvas` | `#d8d4ca` | 외부 캔버스 |
| `--subtle` | `#e8e2d6` | 연한 배경 강조 |
| `--border` | `#d8d0be` | 구분선 |
| `--ink` | `#20264A` | 기본 텍스트 (Navy) |
| `--ink-2` | `#4a4f6a` | 보조 텍스트 |
| `--ink-3` | `#6f7390` | 삼차 텍스트 (날짜·메타) |

### 포인트 컬러

| 토큰 | 값 | 용도 |
|---|---|---|
| `--accent` | `#2B3FD4` | Cobalt blue — 링크·CTA·포인트 전용 |
| `--accent-tint` | `#bcc6ff` | 연한 코발트 (selection 배경) |
| `--accent-tint2` | `#dfe3ff` | 아주 연한 코발트 |
| `--pop` | `#d8a33f` | 머스터드 — 서브 CTA |
| `--pop-tint` | `#f0dca8` | 연한 머스터드 |
| `--pop-ink` | `#8a6313` | 진한 머스터드 |

### 카테고리 컬러 (8종, PostList·CategoryBadge 전용)

기획 `#3E6B4F` · 아키텍처 `#4E6CA8` · 전략 `#A84B4B` · 기술 `#3E6B6B` · 설계 `#7A5C7E` · 리서치 `#B07A2E` · 품질 `#6B6B3E` · 리더십 `#B5602E`

## 5. 타이포그래피 — 한국어 전용 4종 폰트

### 폰트 역할 분담

| 토큰 | 폰트 | 용도 |
|---|---|---|
| `--font-display` | Jua | 홈 h1, 섹션 제목, 로고, 포스트 h1 |
| `--font-body` | Gowun Dodum | 본문, 포스트 h2/h3/h4 (가독성 보호) |
| `--font-mono` | Space Mono | 날짜·카테고리 레이블, nav, 버튼, 메타 |
| `--font-hand` | Gaegu | 손글씨 포인트 텍스트 (홈 hero 인트로) |
| `--font-code` | JetBrains Mono | 코드 블록 전용 |

**Jua 남용 주의**: Jua는 장식적·둥근 서체라 본문 h2/h3에 쓰면 가독성이 낮아진다. 포스트 본문 내부 소제목(h2~h4)은 `Gowun Dodum`을 명시적으로 사용한다.

### 스케일

Display(홈 h1): `clamp(36px, 5vw, 60px)` / Jua
H1(포스트): `clamp(28px, 5vw, 38px)` / Jua
H2(본문): `26px` / Gowun Dodum 700
H3(본문): `20px` / Gowun Dodum 700
Body: `18px` / Gowun Dodum / 행간 1.7–1.8
Meta/Label: `12–13px` / Space Mono / letter-spacing 0.5px

## 6. 레이아웃 — Editorial Split

### 폭 체계 — 판은 둘, 셸은 지면을 따라간다

페이지 컨테이너 폭은 **두 종류뿐이다**(KAN-068). 지면이 자기 역할을 고르고, 셸(GNB·푸터)은
그 지면의 폭을 따라간다.

| 판 | 토큰 | 값 | 지면 |
| --- | --- | --- | --- |
| 읽는 판 | `--content-max` | 720px | 글 목록 · 카테고리 · 글 상세 · 폭신 대담 · 404 |
| 넓은 판 | `--wide-max` | 1100px | 홈 · 글 지도 |

**페이지 컨테이너에 px 를 직접 적지 않는다.** 셸은 토큰을 읽는데 지면이 숫자를 박으면 둘이
어긋난다 — 실제로 홈에서 GNB 720px 대 본문 1100px, 글 지도에서 720px 대 960px 이 그렇게 났다.

배선은 셋이다.

- `Header` · `Footer` 는 `max-width: var(--shell-max, var(--content-max))` 를 읽는다.
  쉼표 뒤 폴백 덕에 `width` 를 안 넘긴 지면은 720px 그대로다.
- `BaseLayout` 의 `width?: "read" | "wide"`(기본 `"read"`)가 `"wide"` 일 때 `<body>` 에
  `.shell-wide` 를 달고, 그 클래스가 `--shell-max: var(--wide-max)` 를 깐다.
- **지면 본문 컨테이너도 같은 토큰을 가리켜야 한다.** `width="wide"` 만 주고 본문이 720px 이면
  어긋남이 방향만 바뀌어 그대로 남는다.

**홈과 글 목록의 폭이 다른 것은 정상이다.** 일관성은 "모든 지면이 같은 값"이 아니라 "한 화면
안에서 셸과 본문이 같은 선"이다. 720px 로 통일하면 홈 히어로 2열이 열당 294px 로 줄어
회전한 폴라로이드(바운딩 141px)가 들어갈 타이틀 우측 여백이 사라지고, 1100px 로 통일하면
아래 「포스트 본문」이 뒤집히며 읽는 지면 여덟 곳이 재디자인 대상이 된다.

**푸터 저자 라인업은 넓은 판에서도 읽는 판 폭에 묶는다**
(`max-width: calc(var(--content-max) - var(--page-pad) * 2)`). 액자 폭은 `14vw` clamp 라
판이 넓어져도 102×117 로 같지만, 늘어나는 것은 액자 사이 간격(54px → 149px)이고 `--sag` 가
px 고정이라 실의 처짐 곡선이 밋밋해진다 — 그 짜임의 좌표는 624px 폭에서 맞춰진 값이다.

**판정은 눈이 아니라 `bun run width:verify` 다**(`scripts/verify-widths.ts`). 지면마다
`.header-inner` · 페이지 컨테이너 · `.footer-inner` 의 렌더 폭을 재서 셋이 한 값인지 본다.
어느 값이어야 하는지는 안 본다 — 홈 1100 과 글 목록 720 은 설계대로 다르고, 판정하는 것은
**지면 안의 일치**다. 비0 으로 끝나면 그 화면은 못 나간다.

`grep` 만으로는 못 잡는다. 지면이 `var(--wide-max)` 를 제대로 쓰면서 `BaseLayout` 에
`width="wide"` 를 안 넘기면 정확히 그 반대 방향의 같은 어긋남인데, CSS 에 숫자가 없어
검색에 안 걸린다(역검증으로 확인 — grep 은 0건, `width:verify` 는 FAIL).
보조로 쓰는 검색은 이것이고, 페이지 컨테이너가 걸리면 안 된다(컴포넌트 내부 상한은 대상이 아니다).

```bash
grep -rnE 'max-width: *[0-9]{3,}px' src/ | grep -v 'src/pages/design/' | grep -v '@media'
```

### 홈페이지 Hero

2열 그리드 (`1fr 1fr`, gap 36px):
- **좌**: 손글씨 인트로(Gaegu, -3deg 기울임) → Jua h1 → 설명 문구 → CTA 버튼 2개
- **우**: 마스코트 SVG + 해치 패턴 배경 (1:1 비율, card-radius, 점선 border)

모바일 (768px↓): 1열 전환, 마스코트가 h1 위에

### 최근 글 List

border-top 구분선 후 리스트:
- 각 행: `[Space Mono 날짜·카테고리 | Gowun Dodum 제목 | 화살표]`
- 날짜 컬럼 `width: 160px` (mobile: auto)

### 포스트 본문

max-width 720px(= `--content-max`, 위 「폭 체계」의 읽는 판), 중앙 정렬. 포스트 헤더 h1만 Jua, 이후 본문은 Gowun Dodum.

## 7. 모티프 시스템

### 해치 패턴 (`--hatch`)
```css
repeating-linear-gradient(45deg, rgba(43,63,212,.10) 0 1px, transparent 1px 11px)
```
홈 hero 마스코트 배경에 사용. 점선 border (`--hatch-border`: rgba(43,63,212,.30)).

### 손글씨 포인트 (Gaegu)
"반가워요 :)" 같은 짧은 인트로 문구. `transform: rotate(-3deg)`, `color: var(--accent)`.

### 스케치 밑줄 (링크 hover)
`.prose a`, `a.sketch-link` — `::after` scaleX 0→1 좌→우 애니메이션, `var(--accent)` 색.

### 마스코트 '토니'
분홍 빵 캐릭터 SVG (`Mascot.astro`). 홈 hero 우측, 푸터, 빈 상태, 404. idle 흔들림 (reduced-motion 시 정지).

### SVG 모티프
- `Sparkle.astro` — 4꼭지별, 머스터드(`--pop`) 채우기
- `Squiggle.astro` — 물결 구분선, 포스트 헤더 하단

### 데코 키트 (다이어리 레이어) → [`DECO_KIT.md`](./DECO_KIT.md)
마스킹테이프·스티커·두들·포스트잇을 재사용 부품으로 굳힌 **선택 레이어**. 위 모티프
시스템이 지면 전체에 깔리는 기본 어휘라면, 데코 키트는 히어로·목록 머리·글 상세처럼
**고른 지점에만** 얹는 장식이다. 그래서 `deco.css` 는 `global.css` 가 아니라 쓰는 쪽에서
import 한다.

- 부품 `src/components/deco/` · 패턴 `src/components/deco/patterns/` · 토큰 `src/styles/deco.css`
- 살아 있는 카탈로그: `/design/deco` (noindex)
- 장식 총량은 `data-deco="1"~"5"` 손잡이 하나로 접힌다(부품마다 티어 1~4)
- 팔레트·폰트는 **이 문서의 토큰으로 환산**해 쓴다. 코어에 짝이 없는 핑크·레드만
  `--deco-pink` / `--deco-red` 로 `deco.css` 에 따로 둔다(데코 전용 — 본문·UI 는 안 쓴다).

## 8. 버튼 & 형태

| 토큰 | 값 |
|---|---|
| `--btn-radius` | `999px` (pill) |
| `--card-radius` | `14px` |
| `--radius-sm/md/lg` | `8/12/16px` |

버튼 2종:
- **Filled**: `background: var(--accent)`, `color: var(--paper)`, Space Mono 13px
- **Outlined**: `border: 1.5px solid var(--ink)`, `color: var(--ink)`, 호버 시 `--cream` 배경

## 9. 간격

기준 4px. 사용 단위: 4·8·12·16·24·32·48·64·96px. `--page-pad: clamp(20px, 5vw, 48px)` (반응형 측면 여백).

## 10. 모션

기본 `180ms cubic-bezier(0.2, 0.7, 0.2, 1)`. 링크 스케치 밑줄, 버튼 opacity/background, 마스코트 idle 흔들림 (3.4s 무한). `prefers-reduced-motion` 시 모든 애니메이션 정지.

## 11. 보이스 & 마이크로카피

1인칭, 단정하되 친근. 기술 용어 원어 유지. 위트는 가장자리에서.

- 태그라인: "진지하게 만들고, 즐겁게 쓴다."
- 홈 hero 손글씨: "반가워요 :)"
- 글 없음: "아직 풀어둔 생각이 없네요. (토니가 초안을 굽는 중)"
- 404: "이 페이지는 아직 초안(raw)입니다."
- 푸터: "Serious Work, Joyful Wit. — 빵관 토니"

## 12. 에셋 체크리스트

- [x] 손그림 모티프 SVG 세트 (Sparkle, Squiggle)
- [x] 토니 마스코트 SVG (Mascot.astro, companion 포함)
- [x] 한국어 전용 Google Fonts (Jua·Gowun Dodum·Space Mono·Gaegu·JetBrains Mono)
- [x] 해치 패턴 모티프 (`--hatch`)
- [x] CSS 모눈 텍스처 (`.grid-texture`, `--grid-line`)
- [ ] 핸드레터링 로고(워드마크) SVG — 현재 Jua + Sparkle 임시 구현
