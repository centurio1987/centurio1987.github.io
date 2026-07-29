# 데코 키트 v1 — 부품 · 패턴 카탈로그

다이어리 데코(마스킹테이프·스티커·두들·포스트잇)를 **재사용 부품**으로 굳힌 것.
`DESIGN_CONCEPT.md` v0.3 의 팔레트·타이포를 그대로 쓰고, 그 위에 종이 질감만 얹는다.

- **살아 있는 카탈로그**: `/design/deco` (noindex, 사이트맵 제외)
- **부품**: `src/components/deco/` · **패턴**: `src/components/deco/patterns/`
- **토큰·강도·모션**: `src/styles/deco.css` · **자산·코드표**: `src/lib/deco.ts`

---

## 0. 이 키트가 있는 이유

지금 홈에 걸린 `public/tony-deco.webp` 는 마스코트 **주변 장식이 한 장에 구워진**
1254² 래스터다. 말풍선 문구를 고치려면 그림을 다시 굽고, 장식만 덜어낼 수도 없고,
같은 테이프를 다른 페이지에 쓸 수도 없다.

이 키트는 그 한 장을 부품으로 되돌린 것이다. 말풍선은 텍스트가 되고, 테이프는
어디든 각도만 바꿔 붙고, 장식 총량은 손잡이 하나(`data-deco`)로 접힌다.

> 시안은 자체 팔레트(`#E9E2D3` `#24314F` `#2540E8`)와 폰트(Gothic A1 / Nanum Pen
> Script)로 그려졌지만 **전부 블로그 토큰으로 환산**해 들여왔다. 시안 색을 그대로
> 쓰면 팔레트가 두 벌이 되고, Nanum Pen 을 들이면 한국어 웹폰트가 5종 → 6종이 된다
> (손글씨는 이미 Gaegu 가 `--font-hand` 로 있다). 환산표는 `src/styles/deco.css` 머리말.
> 코어에 짝이 없는 핑크·레드만 `--deco-pink` / `--deco-red` 로 새로 두었다 — 데코 전용이라
> `tokens.css` 가 아니라 `deco.css` 에 산다.

---

## 1. 쓰는 법

`deco.css` 는 **전역이 아니라 쓰는 쪽에서 import** 한다(안 쓰는 페이지가 토큰·키프레임을
지고 가지 않게).

```astro
---
import DecoLayer from "../components/deco/DecoLayer.astro";
import Tape from "../components/deco/Tape.astro";
import "../styles/deco.css";
---

<div class="board" data-deco="3">   <!-- 강도 손잡이 -->
  <DecoLayer top="-14px" left="-18px" rotate={-9} tier={2}>
    <Tape variant="check" width={132} />
  </DecoLayer>
  …
</div>

<style>
  .board { position: relative; }   /* DecoLayer 의 배치 기준 — 필수 */
</style>
```

**배치(`DecoLayer`)와 생김새(부품)는 갈라져 있다.** 같은 테이프가 히어로 모서리에도,
코드블록 위에도, 목록 항목에도 각도만 바꿔 붙기 때문이다 — 부품에 위치를 박으면
그때마다 변종이 하나씩 생긴다.

### ⚠ 부모 scoped CSS 로는 부품을 못 고친다

Astro 는 자식 컴포넌트 루트에 **자식의** `data-astro-cid` 만 붙인다. `class` 를 넘겨도
부모 쪽 선택자(`.foo[data-astro-cid-부모]`)는 매칭되지 않는다.

```astro
<!-- ✗ 안 먹는다 -->
<PaperSurface class="swatch" />
<style>.swatch { width: 74px; }</style>

<!-- ○ prop 으로 -->
<PaperSurface width="74px" height="80px" />

<!-- ○ 또는 지역 조상 아래에서 :global -->
<style>.stage :global(.speech-blue) { background: var(--accent-tint); }</style>
```

---

## 2. 강도 (`data-deco`)

부품마다 **티어**가 있고, 감싼 요소의 `data-deco` 값 하나가 어디까지 보일지 정한다.
데코를 지웠다 붙였다 하는 대신 티어를 나눈 이유는, 페이지마다 얼마나 꾸밀지가
맥락에 따라 갈리는데 그때마다 마크업을 고치면 되돌리기가 어렵기 때문이다.

| 강도 | 이름 | 보이는 것 |
|---|---|---|
| 1 | 있는 듯 없는 듯 | 티어 1 만 |
| 2 | 절제 | 티어 2 가 반투명(50%) |
| 3 | **은근하게 (기본)** | 티어 3 까지 |
| 4 | 넉넉히 | 티어 4 까지 |
| 5 | 다이어리 | 4 + 각도·개수를 쓰는 쪽에서 더 |

**티어 배정 원칙** — 없으면 뜻이 상하는 것부터 낮은 티어로.

- **티어 1** 정보를 담은 것(말풍선 문구, 편수 배지, 포스트잇 메모)
- **티어 2** 구조를 거드는 것(판을 붙드는 코너 테이프, 카드를 무는 클립)
- **티어 3** 분위기(폴라로이드, 손글씨 안내, 코드블록 테이프)
- **티어 4** 잉여(여분의 하트·반짝)

`data-deco-hover="off"` 로 호버 갸웃을 끌 수 있다. `prefers-reduced-motion` 은
`global.css` 가 전역으로 이미 끈다.

---

## 3. 부품 카탈로그

코드(`T1`·`S3`…)는 시안 이름 그대로다 — "히어로에 T6 크라프트로 바꿔줘"가 코드에
바로 꽂힌다. 전부 `aria-hidden` 이 기본이고, 문구가 정보인 부품만 `decorative={false}`
로 노출한다.

### MASKING TAPE — `<Tape variant>`

| 코드 | variant | 이름 | 비고 |
|---|---|---|---|
| T1 | `check` | 체크 · 버터 | 기본. 가장 무난 |
| T2 | `stripe` | 사선 스트라이프 · 핑크 | T1 과 짝으로 대각에 |
| T3 | `vellum` | 무지 벨럼 · 반투명 | **글자 위에 얹을 때** |
| T4 | `letter` | 레터링 테이프 | `label` · 어두운 판엔 `tone="dark"` |
| T5 | `dot` | 도트 테이프 | |
| T6 | `kraft` | 찢은 크라프트 | 위아래가 톱니 |

`width` 로 폭만 맞춘다(높이는 종류별 고유값 — 건드리면 테이프로 안 읽힌다).

### STICKER — `<Sticker variant>`

| 코드 | variant | 이름 | 비고 |
|---|---|---|---|
| S1 | `speech` | 말풍선 | `text`, 꼬리 달림 |
| S2 | `ribbon` | 리본 배너 | `text` — 편수·상태 |
| S3 | `star` | 별 3종 | |
| S4 | `diecut` | 원형 다이컷 | `text` (짧게) |
| S5 | `tag` | 택 라벨 | `text` — 값이 **하나**일 때 |
| S6 | `tony` | 토니 다이컷 | 이미지, `size` |

### DOODLE — `<Doodle variant>`

| 코드 | variant | 이름 | 비고 |
|---|---|---|---|
| D1 | `sparkle` | 반짝 (4각) | |
| D2 | `heart` | 하트 | |
| D3 | `arrow` | 곡선 화살표 | `width` `color` `flip` |
| D4 | `wave` | 물결 밑줄 | `width` `color` |
| D5 | `emphasis` | 강조선 · 별표 | |
| D6 | `memo` | 손글씨 메모 | `text` (`\n` 줄바꿈) |

두들은 **그림자가 없다** — 종이에서 뜨면 손그림으로 안 읽힌다.
(기존 `motifs/Sparkle.astro` 와 다르다: 그쪽은 잉크 외곽선이 있는 브랜드 모티프.)

### CLIP · MEMO · FRAME · PAPER

| 코드 | 컴포넌트 | 이름 | 비고 |
|---|---|---|---|
| C1 | `<Clip variant="clip\|binder">` | 종이 클립 · 집게 | 블록 위로 절반 걸치게 |
| M1 | `<StickyNote>` | 포스트잇 메모 | **기본이 노출**(읽으라고 있는 유일한 부품) |
| M2 | `<IndexTab>` | 인덱스 탭 | `tone="pink\|blue\|yellow"` |
| F1 | `<Polaroid>` | 폴라로이드 프레임 | 안은 slot |
| F2 | `<CornerMount>` | 사진 코너 마운트 | **감싸는** 컴포넌트 |
| P1 | `<Stamp variant="date\|round">` | 날짜 · 도장 | 한 항목에만 |
| P2 | `<TicketStub>` | 티켓 스텁 | 값이 **둘**일 때 |
| B1 | `<PaperSurface paper>` | 모눈 · 도트 · 노트 · 무지 | 데코를 얹는 판 |

---

## 4. 적용 패턴

시안의 적용 페이지(홈·목록·글 지도·글 상세)에서 되풀이되는 짜임을 뽑은 것.
같은 짜임을 각자 손으로 붙이면 각도·오프셋이 조금씩 어긋나 "같은 손이 붙인" 느낌이
깨지므로, 짜임 자체를 컴포넌트로 굳혔다.

| ID | 컴포넌트 | 어디서 나왔나 | 짜임 |
|---|---|---|---|
| **P-01** | `TapedBoard` | 글 지도 · 글 배너 · 히어로 판 | 종이 + 마주 보는 두 모서리에 테이프 |
| **P-02** | `HeroCollage` | 홈 히어로 | 판 + 마스코트 + 말풍선 ×2 + 반짝·하트 + 코너 테이프 + 폴라로이드 |
| **P-03** | `ClippedCard` | 목록 필터 · 시리즈 카드 | 카드 위 모서리에 클립 |
| **P-04** | `TapedQuote` | 글 상세 인용 | 세로선 + 위 모서리 벨럼 테이프 + 손글씨 출처 |
| **P-05** | `TapedCode` | 글 상세 코드블록 | 블록 **위쪽 밖**에 테이프 + 오른쪽 밖 포스트잇 |
| **P-06** | `DecoHeading` | 홈 "최근 글" · 목록 "글" | 제목 + 개수 배지(탭\|리본) + 레터링 테이프 |
| **P-07** | (`Stamp` 조합) | 홈·목록 최신 글 | 목록 **첫 항목에만** NEW 도장 |
| **P-08** | (`TicketStub` 조합) | 글 상세 하단 | 티켓 + 손글씨 + 도장 |

P-07·P-08 은 부품 두셋을 그 자리에서 얹는 것이라 컴포넌트로 굳히지 않았다
(레시피는 `/design/deco` 의 해당 섹션 마크업이 그대로 예시다).

---

## 5. 배치 규칙

키트를 쓰다 깨진 자리들 — 그대로 규칙이 됐다.

1. **테이프는 판 밖으로 걸쳐야 한다.** 안쪽에만 있으면 붙인 게 아니라 무늬로 읽힌다.
   그래서 판은 `overflow` 를 자르지 않고, 감싼 쪽이 걸치는 양보다 큰 여백을 준다.
2. **가로로 걸치는 오프셋은 px, 세로는 %.** 가로도 %로 두면 판이 넓어질수록 음수
   오프셋이 같이 커져 부품이 여백을 넘어 잘린다 — 테이프·말풍선은 크기가 고정된
   물건이라 걸치는 양도 고정이어야 맞다.
3. **읽는 것 위에 불투명한 걸 얹지 않는다.** 인용 위엔 반투명 벨럼(T3)만, 코드블록엔
   위쪽 **밖**에만. 코드 위를 덮는 데코는 금지다.
4. **도장은 하나에만.** 목록의 모든 줄에 찍으면 "이것만 특별"이라는 뜻이 사라진다.
5. **제목 옆 부품은 하나만.** 탭과 리본을 둘 다 붙이면 어느 쪽이 정보인지 흐려진다.
6. **좁은 화면에선 접는다.** 데코는 여백에 사는데 모바일엔 여백이 없다. 768px 이하에서
   `TapedCode` 는 데코를 통째로 숨기고, `HeroCollage` 는 말풍선만 남긴다.
7. **각도는 -12°~12°.** 넘어가면 손으로 붙인 게 아니라 흘러내린 것으로 보인다.

## 6. 접근성

- 부품은 전부 `aria-hidden="true"` 기본 + `pointer-events:none`(글자 선택·클릭을
  가로채지 않게). 호버 갸웃을 받는 자식만 이벤트를 되살린다.
- 문구가 정보인 곳만 노출한다 — `StickyNote`(기본 노출), `DecoHeading` 의 개수 배지,
  그 밖에는 `decorative={false}` 를 명시.
- 모션은 호버당 1회. 읽는 화면에서 무한 반복은 시선을 뺏는다.

## 7. 자산

| 파일 | 크기 | 쓰임 |
|---|---|---|
| `public/images/deco/tony-diecut.webp` | 712×975, 82KB | S6 · 히어로 콜라주 |
| `public/images/authors/tony-full.webp` | 161×220 | 폴라로이드 안 등 ~160px 이하 |

`tony-diecut.webp` 는 `public/tony-deco.webp` 에서 마스코트만 떼어낸 것이다(배경
flood fill → 최대 연결요소 → bbox 크롭). 시안의 `tony-cutout.png`·`tony-sticker.png`
는 들여오지 않았다 — 같은 그림이 PNG 로 1.7MB 더 늘 뿐이고, 흰 다이컷 테두리는 이미
합성물에 그려져 있다. 테두리를 새로 그려야 하면 `.deco-diecut`(투명 실루엣 둘레에
`drop-shadow` 를 겹쳐 흰 여백을 만드는 유틸)을 쓴다.
