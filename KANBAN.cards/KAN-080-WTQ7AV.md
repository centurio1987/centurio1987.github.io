---
card: KAN-080-WTQ7AV
title: 타이포그래피가 하나의 디자인 스타일 안에서 일관성 없이 정의되어 있다. 하나의 디자인 스타일을 준수하는 타이포그래피 조합을 조사하여 채택해라.
created: 2026-09-01
scope: src/**, design-concept/**, scripts/lib/tokens/**, scripts/verify-tokens.ts, scripts/tokens-baseline.json, scripts/fixtures/tokens/**, scripts/check-recognize-invariant.ts, scripts/compare-render.ts, scripts/render-viz.ts, .claude/skills/react-sim/assets/REACT_SIM_GUIDE.md, AGENTS.md
---

# KAN-080-WTQ7AV — 타이포그래피가 하나의 디자인 스타일 안에서 일관성 없이 정의되어 있다. 하나의 디자인 스타일을 준수하는 타이포그래피 조합을 조사하여 채택해라.

## 전략
### 무엇이 문제인가 — 네 축 중 하나만 서 있다

`src/styles/tokens.css:215-241` 이 정의하는 것은 **서체 5종과 크기 10단**뿐이다. **굵기·행간·자간 토큰은 0개**다.

| 축 | 토큰 | 실사용 | 값 종류 |
| --- | --- | --- | --- |
| 서체 | 5 | 405자리 | CSS `font-family` 리터럴 **0건** — 깨끗하다. 단 **JSX raw 문자열 40여 자리는 게이트 밖**이라 이 「0건」은 반쪽이다 |
| 크기 | 10 | 480자리 | CSS px 리터럴 **4건**뿐 — 수렴했다 |
| **굵기** | **0** | CSS 90 + JSX 108 ≈ **198** | **5종** (400·500·600·700·800) |
| **행간** | **0** | CSS 60 + JSX 71 = **131** | **21종** (1.15 · 1.22 · 1.35 · 1.55 · 1.85 · 1.95 …) |
| **자간** | **0** | CSS 47 (JSX 는 SVG 속성 1) | **22종**, px·em **혼용** (0.5px · 0.1em · 1.4px · 0.34em) |

**토큰이 있는 축은 지켜졌고 없는 축만 흩어져 있다.** 규율의 문제가 아니라 **자가 없는 문제**다.

### 정본이 존재하지 않는 값을 규정하고 있다

`BaseLayout.astro:88` 의 Google Fonts URL 을 실제로 받아 `@font-face` 를 세었다 — **Gowun Dodum 과 Jua 는 웨이트 400 한 종뿐**이다(URL 에 `wght` 를 안 붙인 것이 실수가 아니라 붙일 값이 없어서다). Gaegu 400·700 · Space Mono 400·700 · JetBrains Mono 400·500.

그런데 `DESIGN_CONCEPT.md:187-188` 은 H2·H3 를 **"Gowun Dodum 700"** 이라고 규정한다. **그 웨이트는 존재하지 않는다.** 결과 넷:

1. **합성 볼드 100여 자리** — 전역 `h1~h4 { font-weight: 700 }`(`global.css:45-51`) · `.prose h2/h3`(`PostLayout.astro:251-253,262-264`) · 발행 글 30편의 모든 `**굵게**`(`strong`·`b` 규칙 **0건**, UA 기본 `bolder`) · 시뮬 `fontWeight: 600` 64자리. `font-synthesis` 선언도 **0건**이라 막을 것이 없다.
2. **무효 선언 12자리** — 400만 있는 패밀리에 `font-weight: 500` 은 400 으로 떨어지고 합성도 안 걸린다. `.prose a { font-weight: 500 }`(`global.css:63`) 이 그중 하나다 — **본문 링크 강조가 화면에 안 나타난다.**
3. **이미 구워진 픽셀** — `PosterHero.tsx:147` 의 `fontWeight={800}` + Gowun Dodum 합성이 `hero.webp` **27장** 안에 래스터로 박혀 있다.
4. **팀은 이미 배웠는데 전이가 안 됐다** — Gaegu 만 `wght@400;700` 을 받고 근거까지 적혀 있고(`PhotoFrame.astro:462-466` "Gaegu 400 은 획이 너무 옅다"), Jua 쓰는 자리는 전부 `font-weight: 400` 을 되돌려 놓아 합성이 한 건도 없다. **같은 규율이 Gowun Dodum 에만 적용되지 않았다.**

경위는 `DESIGN_CONCEPT.md:18` 에 있다 — v0.2 는 **Pretendard 단일 폰트**(웨이트 다수)였고 v0.3 이 개성을 위해 한국어 전용 4종으로 갈아탔다. **서술은 v0.2 식으로 남고 근거만 사라졌다.**

### 게이트가 이 셋을 못 본다

`bun run tokens:verify` 는 지금 `✓ 통과`라고 답한다. 글자 축 판정이 `font-size` 23건뿐이기 때문이다.

- `docrule.ts:369` 가 문지기다 — `font-size` 가 아니면 `:395-400` 으로 떨어져 **판정 불가**. 실측 분해: `line-height` 100 · `font-weight` 90 · `letter-spacing` 49 = **세 축 239**, 여기에 `font-size` 판정 불가 7을 더한 246 에서 제외분 2를 뺀 **244** 가 `tokens-baseline.json:8` 의 `font / 판정 불가` 다. `UI_CONSISTENCY_AUDIT.md:474` 도 세 축을 **239** 로 적는다 — **이 카드가 여는 것은 239 이고 244 가 아니다.**
- `docrule.ts:422-445` 의 `notes` 가 `dimension·position·shadow·zindex` 만 출력해 **이 239건이 게이트 화면에 한 글자도 안 나온다**(`font-size` 판정 불가 7 은 자기 줄이 있다).
- `propAxis.ts:105-111` 의 `UNITLESS_PROPS` 가 `font-weight`·`line-height` 를 새 인식층 넷에서 제외해 JSX `fontWeight` 116건 · `lineHeight` 71건은 **히트조차 안 난다.**
- `fontFamily: "monospace"` 40여 자리(13파일)는 문자열이라 인식 밖이다 — **발행된 시뮬 20여 편의 코드 글자가 OS 기본 고정폭으로 뜬다.** 같은 글 안에서 마크다운 코드블록(JetBrains Mono)과 시뮬 코드가 다른 서체다. `UI_CONSISTENCY_AUDIT.md:689-693` 의 "폰트 축은 실제로 깨끗하다"는 kebab-case 만 센 **반쪽 판정**이다.

### 유저가 정한 것 둘

1. **범위 = 스타일 조사 후 통째 채택.** 폰트 조합까지 다시 고른다. 화면 전면 변경을 감수한다(2026-08-31).
2. **KAN-079-1QVHJ2(토큰 게이트 하드월)와 직렬, KAN-080 선행.** 순서가 반대면 하드월 위에서 글자 축을 여는 순간 위반이 CI 를 빨갛게 만들고, 게이트가 `main.yml:69-79` 에서 `astro build` 앞에 돌며 `deploy` 가 `needs: build` 라 **사이트 배포가 멈춘다.**

### 1. 「통째 채택」의 대상은 계약이지 얼굴이 아니다

카탈로그 51종의 sans 를 세었다 — **Pretendard 계열 41 · IBM Plex Sans KR 1 · Noto Sans JP 2 · Jua·Gowun Dodum 0.** 스타일 하나를 통째로 복사하면 80% 확률로 v0.3 결정이 근거 없이 뒤집힌다.

그런데 이 카드가 발견한 결함은 얼굴이 아니라 **계약**이다. "Gowun Dodum 700" 이 존재하지 않는다는 것은 「한국어 전용 4종」 정책의 결함이 아니라 **그 개별 서체**의 성질이다.

> **카탈로그에서 가져오는 것은 `typography` 계약 — `fontFamily {sans, mono}` + `scale` 의 `{fontSize, lineHeight, letterSpacing, fontWeight}` 4축 구조다. 서체는 그 계약이 요구하는 「실재하는 웨이트 축」을 한국어 요건으로 다시 고른다.**

**역할 수는 카탈로그의 6이 아니라 블로그의 10을 유지한다.** Small·Micro·Nano 세 단은 §5 가 화면 실측 65건으로 세운 것이라 6으로 접으면 그 근거가 버려진다.

### 2. 본문 서체 하나만 바꾸면 굵기 축이 선다

| 자리 | 필요 웨이트 | 지금 | 판정 |
| --- | --- | --- | --- |
| h2/h3 · `strong` · `.prose a` 500 · 시뮬 600 | 400/500/600/700 | **Gowun Dodum (400 한 종)** | **교체** |
| 홈 h1 · 섹션 제목 · 로고 (`--font-display`) | 400 하나면 충분 | Jua | **유지** |
| 손글씨 (`--font-hand`) | 400+700 | Gaegu (실로드) | **유지** |
| 고정폭 셋 — Space Mono · JetBrains Mono · 시뮬 raw `monospace` | — | **갈려 있다** | **접을지가 미결 — `S2` R7 이 정한다** |

**고정폭을 접는 근거로 「카탈로그 계약이 `mono` 하나다」를 쓰면 자기모순이다.** 아래 「버린 대안 ①」이 카탈로그 통째 복사를 v0.3 회귀라는 이유로 거부하는데, 같은 카탈로그를 근거로 Space Mono 를 걷으면 잣대가 둘이 된다. Space Mono 는 `DESIGN_CONCEPT.md:172` 가 배정한 얼굴이고 §5 의 `letter-spacing 0.5px` 규정이 거기 붙어 있다 — Jua·Gaegu 와 **같은 잣대로 판단한다.** 접기로 정하면 그것도 서체 변경이라 `S7` 에 들지 구획 work 가 아니다. **시뮬의 raw `monospace` 를 `--font-code` 로 모으는 것은 별개**이고(토큰 우회를 닫는 일이라 무조건 한다) 구획 work 에 남는다.

**본문 후보 실측** (Google Fonts 는 없는 웨이트에도 HTTP 200 을 돌려주므로 내려온 `font-weight` 로 판정):

| 패밀리 | 실재 웨이트 | 서브셋당 평균 | 비고 |
| --- | --- | --- | --- |
| **Gothic A1** | **9단 (100~900)** | **8 KB** | 웨이트 최다이면서 가장 가볍다 |
| **IBM Plex Sans KR** | **7단 (100~700)** | **10 KB** | **카탈로그 51종 안에 실재하는 유일한 한국어 서체**, `IBM Plex Mono` 와 한 가족 |
| Noto Sans KR | 6단 + 가변 100..900 | 22~23 KB | 무겁다 |
| **Gowun Dodum (현재)** | **400 뿐** | **14 KB** | **R1 불합격 — 확정 탈락** |

**둘 다 굵기 축을 가지면서 현재보다 가볍다.** `KAN-060`(웹폰트 530KB 회선 점유)과 충돌하지 않고 함께 풀린다.

### 3. 토큰은 `--font-` 접두 아래로, 자간은 `em` 으로

**`axis.ts:88-97` 과 `types.ts:40-49` 는 한 글자도 안 고친다.** `axis.ts:90` 이 이미 `--font-` 를 font 로 보고 `extract.ts:75` 도 그렇다 — **두 표가 합치하는 유일한 접두다**(`--text-` 는 추출 쪽에서 `other` 라 이미 어긋나 있다).

`fontRoles()` 오염 조건은 이름이 아니라 **값에 px 가 있는 것**이다 — `docrule.ts:163` 의 `if (!found.length) continue` 가 px 없는 값을 버린다. `--font-weight-bold: 700`(무단위) · `--font-leading-body: 1.7`(무단위) · `--font-track-wide: 0.03em`(em) 은 안전하고 **px 자간만 오염된다.** `em` 이 설계상으로도 옳다 — §5 가 Meta(13px)와 Label(12px)에 같은 절대값 `0.5px` 을 준 것이 지금의 어긋남이다.

### 4. 새 `Axis` 값을 만들면 안 된다

`extract.ts:141` 이 맨 정수를 **`font` 축에서만** 살린다. 그래서 CSS `font-weight: 700` 은 옛 `DECL` 경로가 **이미 `axis: "font"` 히트로 내고 있다**(굵기 90건의 정체). 새 인식기가 같은 자리를 `axis: "weight"` 로 내면 옛 히트를 옮기는 것이 되어 `tokens:invariant` 의 「옛 히트 불변」이 깨진다.

→ **히트 축은 `font` 그대로, 갈래는 판정 사유로 가른다.** `baseline.ts:61-68` 의 `judgeAxis()` 가 사유 접두로 축을 되뽑는 기존 장치를 쓴다(`color.ts:201` 의 `"stroke 축 —"` 선례). `"굵기 축 —"`·`"행간 축 —"`·`"자간 축 —"` 셋을 더하면 래칫 칸이 셋으로 갈려 각자 물린다.

### 5. 순서 — 게이트 먼저, 폰트 다음, 값 마지막

```
설계 → 게이트(인식+판정+토큰) → 폰트 교체 → 구획별 값 치환
        [화면 0]                  [화면 대폭]   [접히는 값만 움직인다]
```

**폰트 교체를 값 치환보다 앞에 두는 것이 이 카드의 핵심 설계 판단이다.** 그러면 **서체가 바뀌는 work 가 정확히 하나**가 되어 뒤따르는 구획 work 는 `render:compare` 의 차이를 **「접기 규약이 예측한 것인가」라는 결정론적 기준**으로 읽을 수 있다. 거꾸로 두면 서체 변화와 값 접힘이 한 차분에 섞여 어느 것이 어느 쪽에서 왔는지 못 가른다.

**화면이 바뀌는 work 는 둘이다 — `S7`(서체)과 `S9`(두들 마크 기준선).** 되돌림도 이 둘이 짝이다. **그리고 구획 work 도 화면을 바꾼다** — `S3` 이 접으므로 접히는 값은 움직인다. 판정은 「전후 동일」이 아니라 **「움직인 자리가 전부 `S3` 의 접기 표 안인가」** 이고, 사람 판단이 아니라 **목록 대조**여야 한다.

### 버린 대안 일곱

| 버린 것 | 왜 |
| --- | --- |
| 카탈로그 스타일 1종 통째 복사 | 41/51 이 Pretendard 계열 — v0.3 결정을 되돌린다. 역할도 6으로 줄어 §5 의 실측 근거가 버려진다 |
| 값 체계만 세우고 서체 유지 | Gowun Dodum 에 700 이 없어 §5 를 지키는 유일한 길이 「700 을 쓰지 마라」가 되고, 그러면 h2/h3/strong 이 전부 400 이 되어 **본문 위계가 사라진다** |
| 합성 볼드를 허용하고 문서만 고친다 | 합성 볼드는 `getComputedStyle` 의 `font-weight` 가 **700 으로 같게 나온다** — `render:compare` 도 게이트도 영영 못 본다. **지금이 정확히 그 상태다** |
| 자체 호스팅 + 가변폰트 | `<link>` 한 줄이 `@font-face`+preload+`public/fonts/` 로 벌어지고 KAN-059 서브셋 실측이 무효가 된다. 별건 |
| `types.ts` 의 `Axis` 에 세 값 신설 | 옛 `DECL` 이 이미 `font` 으로 내는 CSS 히트 190여 자리를 옮겨 불변이 깨진다 |
| `UNITLESS_PROPS` 에서 두 속성 제거 | `pxify`(`propAxis.ts:127`)가 `lineHeight: 1.6` → `1.6px` 로 올려 **값이 거짓**이 된다. `svgStroke.ts:56` 이 같은 문제를 `coord` 로 푼 선례를 따른다 |
| `extract.ts:89` 의 `LITERAL` 수정 | 감사 원자료 3,539 히트 대조가 깨진다. `styleNum.ts:57-62` 가 자기 `NUM` 을 따로 만든 선례를 따른다 |

### 범위 밖 — hero webp 27장

`apply-viz.ts:163` 이 viz 블록을 이미지 링크로 **치환해 소비**했고 그게 draft 단계라 커밋에 안 남았다. 실측: 발행 글에 잔존 블록 **0건** · 사이드카 **0건** · 커밋 이력 전체에 hero 스펙을 담은 파일이 미발행 draft **하나뿐**(`draft/pagination-anatomy-1.mdx`). 남은 건 픽셀뿐이라 되굽기는 「27장 스펙 재작성」이고 이 카드 크기를 넘는다.
→ **굽는 코드만 고쳐 앞으로 굽는 것부터 맞게 하고 굳은 27장은 안 건드린다.** `S19` 가 그 사실을 문서에 적어 다음 사람이 다시 파헤치지 않게 하고 후속 카드로 쪼갠다. **인라인 viz 28개는 SSR SVG 라 자동으로 새 서체가 된다** — 영향받는 것은 래스터된 hero 뿐이다.

### 근거 문서

플랜 전문(리스크·배치 2안 포함): `~/.claude/plans/kan-080-wtq7av-snoopy-pony.md`. `plan-reviewer` 검토 10건을 전부 반영한 판이다.

## 실행 계획
work 하나 = 커밋 하나 = revert 단위. 태그 `kan/KAN-080-WTQ7AV/S<n>`.

- [ ] `S1` 글자 4축 전수 지도 — 실측을 굳힌다
- [ ] `S2` 서체 조사와 선정 — 굵기 축이 실재하는 한국어 조합
- [ ] `S3` 타입 스케일 확정 — 10역할 × 4축
- [ ] `S4` 정본 1차 — §5 재작성 · v0.2 화석 둘 · 시뮬 템플릿
- [ ] `S5` 인식기 둘 — `typeUnitless` + `fontFamilyStr` [기준선 갱신 #1]
- [ ] `S6` 토큰 신설 + 판정층 + `fontRoles` 좁히기 [기준선 갱신 #2]
- [ ] `S7` 폰트 교체 — 다섯 선언 동시 [화면이 바뀌는 work 1/2]
- [ ] `S8` `type:verify` 신설 — 선언한 웨이트가 실제로 로드되는지 (2층)
- [ ] `S9` 데코 실측값 재측정 — `--dm-shift` 스윕 [화면이 바뀌는 work 2/2]
- [ ] `S10` 시뮬 구획 1 — `osi-7-layers` (12파일)
- [ ] `S11` 시뮬 구획 2 — `vpn-anatomy` · `webrtc` (14파일)
- [ ] `S12` 시뮬 구획 3 — `auth-authz` · `container-anatomy` · `tauri` 등 (9파일)
- [ ] `S13` 레이아웃·페이지 구획 (212자리)
- [ ] `S14` 데코 부품 구획 (11파일 111자리)
- [ ] `S15` 공용 컴포넌트 구획 (110자리)
- [ ] `S16` 폭신 대담 구획 (59자리)
- [ ] `S17` viz 구획 — 로컬 3종 + 사본층 둘
- [ ] `S18` `/graph` 구획 (45자리)
- [ ] `S19` 정본 2차 + 수렴 확인

### 단계별 완료 기준

**`S1`** — 굵기·행간·자간·raw 폰트·크기 px 의 각 자리마다 `(파일, 줄, 형태, 속성, 값, 구획)`. 8구획의 합 = 전체(겹침 0·빠짐 0). **조사 스크립트를 레포에 안 남긴다** — `S5` 이후 `tokens:verify --json` 으로 재현한다(KAN-076 S1 규약).

**`S2`** — 기준 일곱을 실측값으로 채운다: R1 실재 웨이트 수(CSS2 응답의 `@font-face`) · R2 가변 여부 · R3 18px/행간1.7 장문 실렌더 · R4 Google Fonts 제공 · R5 서브셋 무게 · R6 라이선스(OFL) · **R7 메타 고정폭을 접을 것인가**(전략 §2 — Jua·Gaegu 와 같은 잣대로). 4역할 조합·로드 웨이트·`BaseLayout` URL 초안이 확정되고 **「Jua·Gaegu 유지 · Gowun Dodum 교체」 가설이 검증되거나 반증된다.** 코드 변경 0.

**`S3`** — 값이 실측 분포에서 수렴한다. **행간**(CSS+JSX 130자리 22종)은 이미 띠를 이룬다 — `1`(19, 라벨) · `1.15~1.3`(9) · `1.35~1.5`(18) · **`1.55~1.65`(48, 지배 구간)** · `1.7~1.8`(27) · `1.85~2`(7, 대담). 가장 큰 이득이 시각 차이 없는 `1.55·1.6·1.65` 48자리를 한 값으로 모으는 것이다. **자간**(CSS 43자리 21종)은 **em 이 이미 다수**(em 24 · px 18)이고 px→em 환산이 결정론적이다 — `0.5px` 9자리가 Meta(13px) 0.038em · Label(12px) 0.042em 이라 **둘 다 `0.04em` 으로 접힌다.** 결과: 굵기 5→4단 · 행간 22→5~6단 · 자간 21→5단, **자간은 전부 `em`.** 접는 규약을 §5 의 「동률은 작은 쪽으로」와 같은 형식으로 명시하고, 대담의 1.9/1.95 를 어느 단으로 볼지 정하며, **무효였던 `font-weight: 500` 12자리가 살아나는 것이 의도인지** 판정한다.

**`S4`** — ① `DESIGN_CONCEPT.md` §5(`:164-219`)가 4축 표로 재작성되고 `:187-188` 의 "Gowun Dodum 700" 이 사라진다. ② `DIAGRAM_STYLE_GUIDE.md:52-56` 와 `AGENTS.md:52` 의 v0.2 Pretendard 화석이 걷힌다(같은 문서 `:128` 과의 자기모순 포함). ③ `.claude/skills/react-sim/assets/REACT_SIM_GUIDE.md:60` 의 `fontWeight: 600` 템플릿이 토큰 참조로 간다 — **시뮬 64자리의 출처라 구획 work 보다 앞이어야 실효가 있다.**

**`S5`** — `typeUnitless` 관할은 `UNITLESS_PROPS` 에 갇힌 `fontWeight`·`lineHeight` 세 형태(JSX style 객체·표현식 / `.astro` 인라인 `style` / **CSS 선언의 소수 `line-height` 만**). **`letterSpacing` 은 관할 밖** — `styleNum.ts:267` 이 pxify 로 잡는 것은 맞지만 실측하면 JSX `letterSpacing` 은 1건뿐(`PosterHero.tsx:132` 의 SVG 속성, 문자열이라 관할 밖)이고 자간 47자리는 전부 CSS 다. **지금 겹칠 자리는 0 이고 장래 겹침을 미리 가르는 것이다.**
`fontFamilyStr` 은 실측으로 찾은 구멍이다 — `font-family` 히트가 **131건 전부 `css-decl`·준수**이고 JSX raw `fontFamily: "monospace"` **40여 자리는 히트 0건**이다. 없으면 `S10`~`S12` 의 완료 기준을 게이트로 증명할 수 없다.
**CSS 소수 파편(`1.75` → `1`·`75`)을 내릴 때 `verdict` 를 건드리면 안 된다** — `측정 제외` → `판정 불가` 접기는 `color.ts:179` 의 `emit()` 안에만 있고 `docrule` 은 직접 박는데, `check-recognize-invariant.ts` 의 `keyOf` 가 **`verdict` 를 키에 넣고 `reason` 은 뺀다.** `verdict` 는 `판정 불가` 그대로 두고 **`auditLabel`·`reason` 만** 바꾼다.
`classify()` 는 **`src === "type-unitless"` 일 때만** 소수를 온전히 무는 `NUM` 을 쓰는 **한 줄**만 연다(`extract.ts:89` 의 옛 `LITERAL` 은 못 고친다).
**판정선**: `fontWeight` 116 · `lineHeight` 71 · raw `fontFamily` 40여 자리가 인식에 들어온다. 고장 픽스처 둘(무단위 굵기=위반 · CSS 소수 행간이 온전히 인식=판정 불가). `tokens:invariant` 옛 히트 증분 0 · 겹침 0. `selfTestFaults` 를 **같은 커밋에서** 갱신.

**`S6`** — `docrule.ts` 를 넓힌다(새 모듈을 안 만든다 — `auditLabelOf`·`driftToken`·`Scale` 이 모듈 지역이고, KAN-076 이 `stroke` 를 `color.ts` 에 넣은 선례가 있으며, 두 모듈이 같은 히트를 claim 하면 판정이 둘 내려간다).
① `--font-weight-*`·`--font-leading-*`·`--font-track-*`(em)이 선다. ② `:369` 뒤에 3갈래 분기 · `:422-445` `notes` 에 세 줄. ③ `baseline.judgeAxis()` 가 사유 접두 셋으로 갈라 **래칫 칸이 셋 는다.** ④ `fontRoles()` 를 `--text-` 접두로 좁히고 **기본 픽스처에 `--text-*` 와 오염 시도 토큰을 심어** `font-min` 이 계속 잡히는지 본다. **함정**: 픽스처에 `--text-body: 18px` 을 세우면 `Ok.astro:13` 의 `font-size: 18px` 이 드리프트가 되어 자가검사 ①이 깨진다 → `var(--text-body)` 로 함께 고친다. ⑤ **화면은 안 바뀐다** — `git diff` 가 `tokens.css` 밖 `src/` 를 안 건드린다. ⑥ 드리프트 급증분을 **같은 커밋에서** 갱신.

**`S7`** — 서체 선언이 **다섯 곳**에 있다: `src/layouts/BaseLayout.astro:88` · `src/styles/tokens.css:215-219` · `scripts/render-viz.ts:50-51`(**이미 갈려 있다** — Jua·Gaegu 없고 JetBrains Mono 700 있음) · `src/lib/viz/blogVizStyleGuide.ts:79-80` · `src/lib/motion/bbangtoTonyStyleGuide.ts:97-98`. `global.css:10-15` 는 그중 **둘만** 짝지어 놨다. `S2` R7 이 「접는다」면 고정폭 교체도 여기 든다.
**리터럴은 한 자리도 안 고친다** — `tokens:verify` 의 위반·드리프트가 안 움직인다(움직였으면 범위를 넘었다).
**`render:compare` 는 exit 1 로 끝나는 것이 정상이다** — `compare-render.ts:97-114` 의 `endOf()` 에 「의도한 차이만」 모드가 없어 차이 1건에도 `code: 1` 이다. **판정은 종료코드가 아니라 diff 목록으로 한다**: 달라진 속성이 서체·굵기뿐이고 **자리(`width`/`height`/`top`/`left`)가 무너진 지면이 0** 인 것이 판정선. 초록을 기대하고 빨간 것을 보고 되돌리면 안 된다.

**`S8`** — **1층 정적(CI 에 넣는다)**: `S3` 의 역할표를 입력으로 각 역할의 `(--font-* 패밀리, --font-weight-* 값)` 짝이 `BaseLayout.astro:88` URL 의 `wght` 안에 있는지 대조한다. `render-viz.ts` 의 `FONT_IMPORT` 와 `blogVizStyleGuide.ts` 도 같은 대조에 넣어 **다섯 선언이 갈리는 것을 함께 막는다.** **시제품으로 확인한 함정**: 소스의 모든 `font-weight` 를 모든 패밀리와 대조하는 소박한 버전은 **오탐**이다(캐스케이드를 몰라 오늘 5역할 전부가 실패로 나온다) — **입력은 역할표여야 한다.** 정적으로 짝을 아는 자리는 59곳뿐이라 2층이 필요하다.
**2층 런타임(CI 밖)**: `dist/` 를 띄워 `document.fonts.check("<w> <size> '<family>'")`. CI 에 Playwright 게이트가 하나도 없는 것과 같은 자리다.
**죽여서 확인**: `--font-body` 를 Gowun Dodum 으로 되돌리면 1층이 빨개져야 한다.

**`S9`** — 정본은 `src/components/deco/DoodleMark.astro:100-116` 이다. `0.426em` 이 "눈대중이 아니라 실측값"으로 박혀 있고 `calc(${size} * ${-mark.h/80} + 0.426em)` 로 33종 마크의 기준선을 정한다. **발행 글 13편 79자리가 이 값 위에 앉아 있다.** `--dm-shift` 스윕을 새 본문 서체로 다시 돌려 `delta = (0.426 − h/2) − shift` 로 뽑고 33종 전부가 본문 잉크 중심 ±0.04em 안에 든다. `DECO_KIT.md` 의 ×0.88 환산비·8.5px·자간 `.24em` 도 다시 잰다. **`deco:verify` 초록만으로 닫지 않는다** — 그 하네스는 겹침·도달성·오버플로만 보고 **잉크 중심 정렬은 안 본다.**

**`S10`~`S12`(시뮬 35파일)** — 그 구획의 굵기·행간·자간·raw 폰트가 토큰으로 간다. **크기는 이미 100% 토큰이라 안 건드린다.** `fontFamily: "monospace"` 가 `var(--font-code)` 로 가고 **같은 글 안에서 마크다운 코드블록과 시뮬 코드가 같은 서체로 뜨는 것**이 판정선이다. 그 구획 래칫 칸 0.
**여기서도 `render:compare` 는 exit 1 이 정상이다** — `S3` 이 접으므로 `1.55` → `1.6` 처럼 값이 움직이고 `monospace` → JetBrains Mono 는 서체 자체가 바뀐다(그 속성이 `compare-render.ts:377` 대조 목록에 있다). **판정선은 「움직인 자리가 전부 `S3` 의 접기 표 안인가」** — 사람 판단이 아니라 목록 대조다. KAN-072 관례대로 **「값 동일 n · 스냅 m」을 갈라 세고**(그 카드 S9: "값 동일 21 · 스냅 77") 스냅이 표가 예측한 방향·크기인지 본다.

**`S13`** — 위와 같다. `global.css:45-51`·`PostLayout.astro:251-253,262-264`·`global.css:63` 이 토큰으로 간다. **`strong`·`b` 규칙을 신설한다**(지금 0건이라 UA 기본 `bolder`).

**`S14`** — **`S9` 뒤여야 한다**(같은 파일이고 재측정 뒤 토큰화라야 한 번만 만진다).

**`S16`** — 행간 1.9/1.95 와 px 자간이 새 스케일에 들어가거나, 못 들어가면 **`exceptions.ts` 에 자리 단위 예외로 등록하고 근거를 `DESIGN_CONCEPT.md` 에 한 절로 적는다.** **`site` 는 `kind` 에 `verdict` 가 있어야만 뜻이 있다**(`exceptions.ts:136-137` 이 강제하고 `:164` 가 그 조건으로 판정한다) — 안 넣으면 `validateExceptions()` 가 게이트를 비0으로 끝낸다. 파일 단위로 걸면 그 파일의 준수분까지 판정에서 내려간다. **굵기는 여기가 합성 0건으로 가장 정확하므로 값을 안 바꾸고 이름만 붙인다.**

**`S17`** — ① `blogVizStyleGuide.ts:77-82` 의 `titleWeight: 700`·`titleFont` 가 실재 웨이트·새 서체로 간다. ② `PosterHero.tsx:147` 의 `fontWeight={800}` 이 실재 웨이트로 간다(**앞으로 굽는 것부터 맞게 — 굳은 27장은 안 건드린다**). ③ 숫자 상수 테이블(토큰율 0%)이 토큰을 참조한다. ④ **`src/lib/viz/text.ts:19` 의 `glyphRatio` 재검증** — 코드포인트 구간으로만 폭을 매기는 **서체 무관 상수**라 폰트를 바꿔도 계산은 그대로인데 실제 폭은 바뀐다. `viz:verify` 가 유일한 방어선이다. ⑤ `src/lib/motion/bbangtoTonyStyleGuide.ts` 는 `typography`·`scale` 을 **파일 안에 안 갖는다**(grep 0건) — `makeFoundations` 가 패키지 기본 `TypographyScale` 을 넣어 주고 블로그가 한 번도 안 덮은 것이다. 덮거나 「소비처가 `gen-motion-css.ts` 의 모션 변수뿐이라 안 덮는다」를 그 자리에 적는다. **착수한 쪽이 그 파일에서 `scale` 을 찾아 헤매지 않게 이 사실을 그대로 적는다.**

**`S19`** — ① `DECO_KIT.md` 가 `S9` 의 새 실측값을 싣는다. ② `UI_CONSISTENCY_AUDIT.md` §6 에 타이포 항이 신설되고 `:474`(「위반으로 셀 수 없으므로 별도 항목이고 **스케일부터 정해야 한다**」 — §6 이 아니라 P1 표 아래 별도 문단이고 굵기/행간/자간 **239건**을 직접 지목한다)의 잠금이 해제된다. ③ **hero 27장이 옛 서체로 굳어 있고 스펙이 레포에도 이력에도 없다**가 문서에 적히고 후속 카드로 쪼개진다. ④ `굵기·행간·자간 / 위반+드리프트 = 0`. 남은 `font / 판정 불가` 는 clamp·vw 처럼 **잴 수 없는 것뿐**임을 목록으로 보인다. ⑤ 문서 넷이 **같은 수를 쓴다.**

### 배치 (착수 시 배치 문서로 확정)

**추천은 오케스트레이션 6배치 · 최대 폭 3** — `B1` S1~S4(직렬) · `B2` S5~S7(직렬, 기준선이 두 번 갱신되므로 띄우면 서로 덮는다) · `B3` S8~S9 · `B4` S10∥S11∥S12 · `B5` S13∥S15∥S18 → S14 · `B6` S16→S17→S19. 밀도 3.2 로 규약(work 3~4) 안이다.
단일 에이전트 6배치(폭 1)와 **배치 수가 같으므로 비교는 「병렬로 아끼는 벽시계」 대 「포트 배정·경합 관리 비용」 하나**로 좁혀진다. 병렬 배치는 각자 `build`+Chromium 을 띄우므로 **배치 문서가 포트를 배정해야 한다.**
**배치 완료 기준에 `--update-baseline` 을 넣는다** — 래칫은 「위반·드리프트가 늘 때만」 물어서, 병렬 work 가 각자 부채를 줄이는 동안 그중 하나가 다른 축에서 늘려도 합산이 기준선 아래면 통과한다. 배치 끝에서 조여야 다음 배치가 그물을 갖는다. work 단위 갱신은 기준선 파일이 병렬 충돌하므로 안 된다.

## 검증
착수한 쪽이 **먼저 돌리고 결과를 검토서에 싣는다.** 검토자에게 다시 돌리라고 하지 않는다.

| # | 명령 | 통과 기준 | 어느 work |
| --- | --- | --- | --- |
| 1 | `bun run tokens:verify` | 종료 0. **`notes` 에 굵기·행간·자간 세 줄이 나온다**(지금은 한 글자도 안 나온다). 래칫 칸이 셋 는다. 자가검사 고장 종수가 늘고 기준선이 그것을 담는다 | S5 S6 · 이후 전부 |
| 2 | `bun run tokens:invariant -- --before /tmp/kan080-before.json --self-test` | **옛 히트 증분 0** · 새·옛 인식 경로 겹침 **0** · 가드 자가검사 통과 | S5 S6 |
| 3 | `bun run render:compare` | **exit 1 이 정상이다** — `compare-render.ts:97-114` 의 `endOf()` 에 「의도한 차이만」 모드가 없어 차이 1건에도 `code: 1` 이다. **종료코드가 아니라 diff 목록으로 판정한다.** S7·S9 는 「자리(width/height/top/left)가 무너진 지면 0」, 구획 works 는 **「움직인 자리가 전부 S3 접기 표 안인가」**(값 동일 n · 스냅 m 을 갈라 센다) | S7 S9 · S10~S18 |
| 4 | `bun run deco:verify` | 겹침 0 · 도달성 전부 · 가로 오버플로 0. **잉크 중심 정렬은 안 보므로 S9 를 이것만으로 닫지 않는다** | S7 S9 S14 |
| 5 | `bun run viz:verify` | SVG 텍스트 넘침 0. **`glyphRatio` 가 서체 무관 상수라 이것이 유일한 방어선** | S7 S17 |
| 6 | `bun run type:verify` | 1층: 선언한 (패밀리 × 웨이트) 짝이 전부 URL 의 `wght` 안. 2층: `document.fonts.check()` 전부 참 | S8 · 이후 전부 |
| 7 | `bun run talk:verify` · `bun run width:verify` · `bun run build` | 종료 0 (build 46쪽) | 모든 work |
| 8 | **죽여서 확인 넷** | ① `RECOGNIZERS` 에서 `typeUnitless` 제거 → `selfTestFaults` 래칫이 **빨개져야** ② `fontRoles` 좁히기 되돌리기 → 픽스처의 오염 토큰이 `font-min` 을 죽여 **빨개져야** ③ `baseline.judgeAxis` 접두 셋 제거 → 세 축이 `font` 칸으로 합쳐져 **기준선이 안 맞아야** ④ `--font-body` 를 Gowun Dodum 으로 되돌리기 → `type:verify` 1층이 **빨개져야** | S5 S6 S8 |

`--before` 스냅샷 뜨는 법(2번):

```
git stash && bun scripts/verify-tokens.ts --json --no-self-test > /tmp/kan080-before.json && git stash pop
```

**최종 판정선은 8-④ 다.** 나머지는 전부 「값이 토큰으로 갔는가」를 재고, ④만 **「글자가 진짜로 굵어졌는가」**를 잰다. 이 카드가 고치려는 결함이 그것이고, 합성 볼드는 `getComputedStyle` 의 `font-weight` 가 700 으로 같게 나오므로 **다른 어떤 검사도 못 본다.**

### 하지 않을 것

- **`tokens:verify --warn-only` 를 붙이지 않는다.** 워크플로 주석이 「로컬 디버깅 전용」으로 못박았다. 게이트가 `main.yml:69-79` 에서 `astro build` 앞에 돌고 `deploy` 가 `needs: build` 라 뚫는 순간 배포 안전망이 사라진다.
- **`render:compare --self-test` 로 화면 검증을 대신하지 않는다.** 그것은 하네스만 보고 마지막 줄에 「대조 안 함」이 박힌다. 판정은 마지막 줄과 종료코드 둘 다로 한다.

## 수행 내역
<!-- KANBAN:LOG append-only — 아래로만 덧붙인다. 위를 고치지 않는다. -->
- 2026-09-01T15:03 · s:6d1364d1 — `전략` 섹션 교체
- 2026-09-01T15:04 · s:6d1364d1 — `전략` 섹션 교체
- 2026-09-01T15:04 · s:6d1364d1 — `전략` 섹션 교체
- 2026-09-01T15:06 · s:6d1364d1 — `실행 계획` 섹션 교체
- 2026-09-01T15:07 · s:6d1364d1 — `검증` 섹션 교체
