---
card: KAN-072-CPJCT1
title: UI 토큰 정합화 — 게이트가 무는 1,395건을 구획 단위로 0 으로 줄인다
created: 2026-08-25
scope: scripts/tokens-baseline.json, scripts/verify-tokens.ts, scripts/lib/tokens/**, scripts/fixtures/tokens/**, src/components/**, src/pages/**, src/layouts/**, src/styles/tokens.css, src/styles/global.css, src/styles/deco.css, src/styles/viz-frame.css, src/styles/viz.css, src/lib/categories.ts, src/lib/doodleMarks.ts, src/lib/viz/Comparison.tsx, src/lib/viz/PosterHero.tsx, src/lib/viz/ProcessSteps.tsx, src/lib/viz/layout.ts, design-concept/DESIGN_CONCEPT.md, design-concept/DECO_KIT.md, design-concept/DIAGRAM_STYLE_GUIDE.md
---

# KAN-072-CPJCT1 — UI 토큰 정합화 — 게이트가 무는 1,395건을 구획 단위로 0 으로 줄인다

## 전략
감사(`design-concept/UI_CONSISTENCY_AUDIT.md`) §5 가 자른 단위를 그대로 받되,
**실행 축을 게이트 갈래에서 파일 구획으로 뒤집는다.**

**왜 뒤집는가 — 갈래로 나누면 같은 파일을 여러 세션이 동시에 연다.** 게이트가 무는
1,395건(위반 1,305 + 드리프트 90)의 파일 합집합은 82개인데 그중 **75개가 두 갈래 이상**이다
(3갈래 29 · 4갈래 16 · 5갈래 10 · 6갈래 2 · 7갈래 1). 특히 글자 축 33파일 중 **32개가 간격 축
안에** 있어(차집합은 `deco/Tape.astro` 한 파일), `KAN-072.4` 와 `KAN-072.5` 를 축별 세션에
주면 32파일에서 부딪힌다. `pages/design/frame-picks.astro` 하나는 일곱 갈래 전부에 걸린다.
수치는 `bun scripts/verify-tokens.ts --json` 전건을 파일별로 접어 낸 것이다.

**파일로 나누면 갈린다.** 글자 축 152건과 radius 축 67건은 `src/components/posts/**` 에
**0건**이고, 반대로 색 축은 368건 중 322건(87%)이 거기 있다. 그래서 `posts/**` 밖을 구획으로
먼저 훑고(글자·radius 가 거기서 완결된다) 발행물은 시리즈 단위로 뒤에 간다.

**카드는 축으로 두고 배치가 파일을 나눈다** (유저 선택 2026-08-27). 카드 완료 판정이 게이트
칸(`축 / 판정`)과 1:1 로 맞아야 하기 때문이다 — 파일 구획 카드로 재편하면 "이 파일들의 모든
축이 0"이라는 판정을 게이트에서 뽑을 수 없다(`files` 맵은 실패했을 때 어느 파일이 늘었는지
지목하는 진단용이고 파일 단위 래칫이 아니다. `scripts/lib/tokens/baseline.ts:130`).
대가는 카드 완료가 뒤쪽 웨이브에 몰리는 것이고, 그 사이 진행은 게이트 카운트가 보여준다.

**첫 수는 치환이 아니라 게이트 인식층이다.** KAN-070 전략(`KANBAN.cards/KAN-070-DRF0QF.md:47`)은
"KAN-072.2 가 `--space-*`·`--text-*` 를 세우면 게이트는 문서를 아예 안 읽는다"를 전제로 코드와
데이터의 의존을 한 방향으로 정했다. 그런데 **그 전환이 구현되지 않은 채 카드가 닫혔다** —
`scripts/lib/tokens/color.ts:54` 의 `COLOR_TOKENS` 는 이름 18개가 고정이고, `:66` 은 `--stroke`
를 정확 일치로 보며, `docrule.ts:66,79` 의 `SPACING_SCALE`·`FONT_ROLES` 는 상수다. 신설할 토큰
6종 중 게이트가 자동으로 인식하는 것은 **radius 하나뿐**이다(`color.ts:64` 가
`includes("radius")` 라서 — 그 덕에 `50%` 25건은 토큰 한 줄로 닫힌다). 그래서
`KAN-072.7-D6DCXJ` 를 세워 그 층만 떼고, **게이트 코드 scope 는 그 카드 하나가 진다.**

**`KAN-072.3` 은 수행 없이 닫는다** (유저 선택 2026-08-27). KAN-070 의 `S5` 가 목표 두 줄을
이미 다 했다 — `docrule.ts:56-62` 가 26개 속성을 여백/치수/위치로 가르고 `:243-252` 가 뒤 둘을
「판정 불가」로 내리며, 감사 정본은 `UI_CONSISTENCY_AUDIT.md:260` 이 572 이고 `:268-279` 에
정정 블록이 붙었다. 카드 메모의 "검토자 572 · 재계산 574" 도 572 로 확정됐다(574 는 레포 전체에서
그 메모 한 곳에만 남은 폐기된 수다).

**제약 넷.**

1. **래칫은 축×판정 칸별로 물고 상쇄가 없다** (`baseline.ts:124`). `spacing / 위반` 을 100
   줄이면서 `color / 위반` 을 1 늘리면 그 커밋이 실패하고, 없던 칸이 새로 생기면 기준선이
   0 이라 그 자리에서 걸린다. **병렬 세션은 커밋마다 `bun run tokens:verify` 초록을 확인한다** —
   웨이브 끝에 몰아 보면 어느 세션이 늘렸는지 못 가른다.
2. **`--update-baseline` 은 자가검사·예외 검사 실패를 무시하고 exit 0 한다**
   (`verify-tokens.ts:98` 이 그 검사들보다 먼저 빠져나간다). 갱신 전에 반드시 맨몸으로 한 번
   돌린다. 게이트가 죽은 채 갱신하면 0 에 가까운 기준선이 박히고 그것이 곧 "다 갚았다"로 보인다.
3. **CI 는 `push: main` 트리거라 브랜치에서 안 돈다**(`KANBAN.cards/KAN-070-DRF0QF.md:182`).
   병합 전까지 로컬 확인이 유일한 그물이다.
4. **`verdict` 예외는 파일 단위이고 값을 못 가른다** — `color.ts:230` 이 그 파일의 색 히트를
   통째로 「정당한 예외」로 내린다("이 파일의 이 3색만"은 지금 구조로 불가능하다). 그래서
   마스코트 28건은 예외 등록이 아니라 팔레트를 토큰·문서에 박는 쪽으로 간다(감사 P2-2 와 같은 방향).

**버린 대안 셋.**

- **축별 병렬(감사 §5 의 사슬을 그대로 세션에 매핑)** — 위 75/82 겹침으로 그 자리에서 깨진다.
- **파일 구획 카드로 재편** — 완료 판정이 게이트 칸과 안 맞고, 카드 6장에 쌓인 브리프·메모
  근거를 옮겨 적어야 한다.
- **게이트 코드를 KAN-072 scope 로 흡수** — `KAN-072.2` 하나가 토큰 데이터와 판정 코드를
  동시에 소유하게 되어 KAN-070 이 세운 분리가 그 자리에서 깨진다.

---

**수행 방식은 오케스트레이션이다 (유저 선택, 2026-08-27).** 배치 7개 · 병렬 폭 최대 3.
work 하나 = 파일 구획 하나이고, 구획마다 **그 파일의 모든 축**을 한 세션이 처리한다.
구획 경계가 곧 세션 경계라 두 세션이 같은 파일을 여는 일이 없다.

구획과 무게(게이트가 무는 건수, `scripts/tokens-baseline.json` 의 `files` 맵 기준):

| 구획 | 파일 | 건수 |
|---|--:|--:|
| 카탈로그 `pages/design/**` | 3 | 216 |
| 그래프 `components/graph/**` | 1 | 81 |
| 데코 `components/deco/**` | 18 | 157 |
| 글 컴포넌트·레이아웃 | 13 | 209 |
| 페이지·셸 | 9 | 53 |
| viz·전역 스타일 | 2 | 53 |
| `posts/**` osi-7-layers | 12 | 255 |
| `posts/**` vpn-anatomy | 9 | 102 |
| `posts/**` webrtc | 5 | 110 |
| `posts/**` auth-authz | 4 | 69 |
| `posts/**` container·tauri | 4 | 56 |
| 마스코트 `motifs/**` | 1 | 34 |
| **합계** | **81** | **1,395** |

## 실행 계획
- [ ] `S1` 게이트 인식층 — 토큰 이름 규칙을 데이터로 (`KAN-072.7`)
- [ ] `S2` 토큰 신설 — `tokens.css` + `DESIGN_CONCEPT` §5·§8·§9 (`KAN-072.2`)
- [ ] `S3` 카탈로그 구획 — `pages/design/**` 3파일 216
- [ ] `S4` 그래프 구획 — `components/graph/**` 1파일 81
- [ ] `S5` 데코 구획 — `components/deco/**` 18파일 157
- [ ] `S6` 글 컴포넌트·레이아웃 구획 — 13파일 209
- [ ] `S7` 페이지·셸 구획 — 9파일 53
- [ ] `S8` viz·전역 스타일 구획 — 2파일 53
- [ ] `S9` osi-7-layers EP1~3 — 6파일 118
- [ ] `S10` osi-7-layers EP4~6 — 6파일 137
- [ ] `S11` vpn-anatomy — 9파일 102
- [ ] `S12` webrtc — 5파일 110
- [ ] `S13` auth-authz — 4파일 69
- [ ] `S14` container-anatomy · tauri — 4파일 56
- [ ] `S15` 마스코트 팔레트 — `motifs/Mascot.astro` 34
- [ ] `S16` 수렴 확인 — 기준선 0 · 카드 6장 완료 판정

**구획은 겹치지 않고 합이 전부다.** 13개 구획의 파일 수 합이 81, 건수 합이 1,395 로
`scripts/tokens-baseline.json` 의 `files` 맵 총계와 같다. 구획 경계가 곧 세션 경계라
두 세션이 같은 파일을 여는 일이 없다.

**단계별 완료 기준**

- `S1` — `tokens.css` 에 `--stroke-hair`·종이흰색·`--state-*`·`--space-*`·`--text-*` 를 임시로
  넣은 워킹트리에서 게이트가 그것들을 **자기 축으로** 판정한다(지금은 전부 `other` 로 샌다).
  자가검사 6종이 그대로 각자 다른 사유로 걸리고, 판정 문구를 바꿨다면 `selftest.ts:32-39` 의
  기대 조각도 함께 갔다. **판정 수는 안 바뀐다** — 인식층만 여는 단계라 이 work 는 위반을
  하나도 안 줄인다(줄면 규칙이 헐거워진 것이므로 되돌아본다).
- `S2` — 토큰이 서고 `DESIGN_CONCEPT` §8 에 선 굵기 스케일과 `50%` 허용이, §9 에 간격 토큰
  이름이, §5 에 글자 토큰 이름이 적힌다. **여기서 radius 위반 25건(`50%`)이 닫힌다** —
  `color.ts:64` 가 이름에 `radius` 가 들어간 토큰을 자동으로 그 축에 넣기 때문이다.
  `1px` 리터럴 131건은 「위반」에서 「드리프트」로 재분류된다(줄지는 않는다 — 치환은 뒤 구획).
  판단 다섯을 이 단계 착수 시점에 유저가 정한다(배치2 문서 4항).
- `S3`~`S15` — 각 구획의 게이트 건수가 0 이고, **다른 축 칸이 하나도 안 늘었다.**
  `bun run tokens:verify` 가 exit 0 이며 커밋 뒤 `--update-baseline` + 기준선 커밋까지 한 단위다.
  `posts/**` 구획(`S9`~`S14`)은 여기에 하나가 더 붙는다 — **그 글을 `astro preview` 로 열어
  시뮬 인터랙션이 도는 것을 확인한다**(감사 P2-1: 발행물의 부품이라 빌드만으론 부족하다).
- `S15` — 마스코트 색 28건이 팔레트로 정리되고 그 팔레트가 `DESIGN_CONCEPT` §7 이나
  `--tony-*` 토큰에 적힌다. **`verdict` 예외로 걸지 않는다** — `color.ts:230` 이 파일 단위라
  그 파일의 색 히트가 통째로 빠져 다섯 번째 분홍이 들어와도 안 잡힌다.
- `S16` — 기준선의 `위반`·`드리프트` 전 칸이 0 이고, 하위 카드 6장이 각자의 축 칸 0 으로
  완료 판정을 받는다. 하드월 승격은 이 카드가 안 한다 — 게이트 코드는 KAN-070 소유다
  (`verify-tokens.ts:20`, `main.yml:73-74`).

## 검증
1. **게이트가 0 을 낸다** — `bun run tokens:verify` 가 `위반`·`드리프트` 전 칸 0 을 보고하고
   exit 0. `scripts/tokens-baseline.json` 이 그 수로 커밋돼 있다.
2. **게이트가 살아 있다** — 자가검사 6종이 각자 다른 사유로 걸린다. 리터럴 한 줄을 일부러
   더한 워킹트리에서 비0 + 그 `파일:줄` 을 지목하고, 지우면 0.
   **이 항이 1번보다 먼저다** — 죽은 게이트와 다 갚은 게이트는 화면에서 같은 모양이다.
3. **회귀 없음** — `bun run build` · `bun scripts/check-post-markers.ts` ·
   `bun scripts/check-emphasis.ts`(+`--dist`) · `bun run viz:verify` · `bun run deco:verify` ·
   `bun run width:verify` · `bun run talk:verify` · `bun run graph:verify` · `tsc --noEmit` 전부 통과.
   `bun run gen:motion` 후 `git diff --exit-code -- src/styles/motion.css` 통과.
4. **발행물이 안 깨졌다** — `posts/**` 를 건드린 글을 `astro preview` 로 열어 시뮬 인터랙션이
   돈다. 빌드만으로는 안 잡힌다.
5. **화면이 안 바뀐 것이 확인됐다** — 주요 지면(홈 · 글 목록 · 글 상세 · 글 지도 · 대담 ·
   `/design/deco`)을 웨이브 전후로 대조한다. 바뀐 자리는 **왜 바뀌었는지가 수행 내역에 적혀
   있다** — "화면 변화 0"이 목표지만 스케일 스냅은 값을 움직이는 일이라 0 을 단정하지 않는다.
6. **다음 리터럴이 막힌다** — 리터럴을 넣은 브랜치를 만들어 `tokens:verify` 가 무는 것을 본다.
   CI 는 `push: main` 트리거라 브랜치에서 안 도므로 로컬로 확인한다.

## 수행 내역
<!-- KANBAN:LOG append-only — 아래로만 덧붙인다. 위를 고치지 않는다. -->
- 2026-08-27T01:09 · s:29c42810 — `전략` 섹션 교체
- 2026-08-27T01:09 · s:29c42810 — `실행 계획` 섹션 교체
- 2026-08-27T01:09 · s:29c42810 — `검증` 섹션 교체
