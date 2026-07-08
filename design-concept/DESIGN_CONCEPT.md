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

max-width 720px, 중앙 정렬. 포스트 헤더 h1만 Jua, 이후 본문은 Gowun Dodum.

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
