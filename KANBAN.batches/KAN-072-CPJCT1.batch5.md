---
card: KAN-072-CPJCT1
batch: 5
created: 2026-08-27
branch: KAN-072-CPJCT1
status: 완료
steps: S9, S10, S11
---

# KAN-072-CPJCT1 배치5 — 발행물 진입 — osi 둘 · vpn (병렬 3)

카드: [KAN-072-CPJCT1.md](../KANBAN.cards/KAN-072-CPJCT1.md) · 범위 `S9` · `S10` · `S11`
선행: [배치4](KAN-072-CPJCT1.batch4.md)

> **이 문서는 착수 전 계획이다.** 수행 내역은 카드 실행 문서의 「수행 내역」에 있다.

## 1. 작업 패키지

**여기부터 발행물이다.** `src/components/posts/**` 는 이미 나간 글의 부품이고, 감사가 준수율
**3.6%** 로 잰 구획이다(35파일 · 위반 389). 색 축 위반 368건 중 **322건(87%)이 여기 있다.**

세 WP 의 완료 기준에 **`astro preview` 인터랙션 확인이 더 붙는다** — 시뮬은 조작해야 도는
컴포넌트라 빌드 통과만으로는 안 깨진 것을 증명하지 못한다(감사 P2-1).

### WP1 · `S9` osi-7-layers EP1~3 — 6파일 118건

`EncapsulationLab`(6) · `LayerTriage`(17) · `FrameAnatomy`(22) · `SwitchLearningLab`(33) ·
`HopJourney`(25) · `RoutingTableLab`(15). `SwitchLearningLab` 은 감사가 꼽은 상위 3파일 중 하나다.

### WP2 · `S10` osi-7-layers EP4~6 — 6파일 137건

`HandshakeLab`(23) · `SlidingWindowLab`(21) · `EncodingLab`(22) · `TlsHandshakeLab`(24) ·
`DnsResolveLab`(19) · `RequestJourneyLab`(28).

### WP3 · `S11` vpn-anatomy — 9파일 102건

`ObserverView`(18) · `CryptokeyRoutingLab`(18) · `SplitTunnelLab`(15) · `NonceReuseLab`(14) ·
`IkeHeaderDissector`(14) · `AntiReplayLab`(7) · `EspOverheadLab`(7) · `OpcodeByte`(5) ·
`ProposalTreeBuilder`(4).

**치환 규약 — `REACT_SIM_GUIDE.md` 규칙 6이 정본이다.**

```tsx
const PASS = "var(--cat-planning, #3E6B4F)";   // 좋은 예 — posts/tauri-2/PermissionGate.tsx:57
```

**fallback 값은 토큰 값과 정확히 같아야 한다.** `tokens.css` 는 전역이라(`global.css:1` ←
`BaseLayout.astro:2`) 이 fallback 은 죽은 값이지만, 값이 어긋나면 **fallback 축 불일치가
새로 생긴다** — `KAN-072.1` 이 0 으로 만든 칸을 이 배치가 다시 늘리는 모양이 된다.
래칫은 칸별로 물므로 그 커밋이 그 자리에서 실패한다.

**지배값 넷이 이 구획의 대부분이다** (`posts/**` raw 집계):
`#6b6357`(73) · `#302d28`(69) · `#fffdf8`(65) · `#c9c1b1`(60). 앞 둘은 **본문 잉크가 두 벌**이라는
그 자리이고(사이트는 코발트 남색 `--ink #20264a`, 여기는 따뜻한 먹색), 셋째가 종이 흰색,
넷째가 선 색이다. 배치2 가 정한 토큰으로 간다.

## 2. 의존과 순서

선행은 배치4 다. `posts/**` 밖이 다 닫힌 뒤에 발행물로 들어간다 — 감사 §4 의 순서 기준 ③
("발행물을 건드리는 것이 마지막이다")이다.

세 WP 사이에는 순서가 없다. 커밋 규약·기준선 갱신은 배치3 과 같다.

**단일 에이전트 안과의 대비.** 357건 + 시리즈마다 preview 확인이 붙어 한 세션이면 배치 **2개**다.
여기가 오케스트레이션의 이득이 가장 큰 자리다 — 세 WP 의 **파일 집합이 안 겹치고**
preview 확인도 따로 난다. 다만 `S9`·`S10` 은 같은 시리즈(osi-7-layers)의 다른 에피소드다 —
파일은 안 겹치지만 **치환 판단은 공유해야 한다**(같은 시리즈 안에서 같은 색이 다르게 옮겨지면
독자가 그것을 본다). 두 WP 는 배치5 착수 시점에 지배값 처리 방식을 먼저 맞춘다.

## 3. 리스크

- **발행된 글이 바뀐다.** 화면이 달라지면 독자가 보는 것이 달라진다. 색을 옮기는 것이지
  고르는 것이 아니므로 **ΔRGB 가 큰 치환은 그 자리에서 멈추고 기록한다.**
- **fallback 을 토큰 값과 어긋나게 적으면 fallback 칸이 는다**(위 규약). 가장 흔한 실수다.
- **시뮬이 조건부로 색을 고른다** — `${cond ? "#fff" : "#000"}` 꼴이 있으면 정규식이 리터럴로만
  잡고 어느 상태에서 쓰이는지는 안 남는다(감사 §6-4). 그래서 preview 조작 확인이 필수다.
- 되돌리기: 시리즈별 커밋이라 글 하나 단위로 되돌릴 수 있다.

## 4. 착수 시점 판단

**착수 2026-08-27. 세 WP 를 그대로 간다 — 미루지 않는다.**

**구획 무게를 다시 쟀다 (`scripts/tokens-baseline.json` 의 `files` 맵).** 계획 시점 수는
배치2 재분류 이전 값이라 낡았다.

| WP | work | 파일 | 계획 시점 | **착수 시점** |
|---|---|--:|--:|--:|
| WP1 osi EP1~3 | `S9` | 6 | 118 | **171** |
| WP2 osi EP4~6 | `S10` | 6 | 137 | **158** |
| WP3 vpn-anatomy | `S11` | 9 | 102 | **149** |
| 합계 | | 21 | 357 | **478** |

파일별 상위: `SwitchLearningLab`(48) · `RoutingTableLab`(34) · `HopJourney`(33) ·
`RequestJourneyLab`(31) · `HandshakeLab`(27) · `NonceReuseLab`(27).

**미루지 않는 근거** — 배치3 이 552건, 배치4 가 443건을 각각 한 웨이브에 닫았다. 478 은 그
사이이고 파일 수(21)는 배치4(25)보다 적다.

### 지배값 처리 — 유저 판정 2026-08-27

§2 가 "두 WP 는 착수 시점에 지배값 처리 방식을 먼저 맞춘다"고 한 자리다. **세 WP 전부에
같은 표를 준다.**

| 값 | 줄 | 쓰임 | → | ΔRGB |
|---|--:|---|---|--:|
| `#6b6357` | 53 | 부속 글자(캡션·팁) | `var(--ink-2, #4a4f6a)` | 43 |
| `#302d28` | 44 | 본문 글자(제목·강조) | `var(--ink, #20264A)` | 38 |
| `#c9c1b1` | 38 | 테두리 30 · 배경 7 | `var(--border, #d8d0be)` | 25 |
| `#fffdf8` | 32 | 패널 배경 | `var(--surface-hi, #fffdf8)` | **0** |

**유저 판정은 「사이트 팔레트로 통합」이다** — 감사(`UI_CONSISTENCY_AUDIT.md:223`)가
`#302d28` 을 "본문 잉크가 두 벌이다"로 지목한 것을 한 벌로 모은다. 선례는
`posts/tauri-2/PermissionGate.tsx:52-57`(`const INK = "var(--ink, #20264A)"`).
**화면이 바뀐다 — 그것이 이 판정의 내용이고, 바뀐 자리는 수행 내역에 적는다.**

### 상태색은 물을 것이 없다 — `--state-*` 신설은 불필요

시뮬이 상수로 뽑아 쓰는 상태색이 **이미 토큰과 값이 정확히 같다.** `var()` 치환만 한다.

```tsx
const OK     = "#3E6B4F";   // = --cat-planning     → var(--cat-planning, #3E6B4F)
const DANGER = "#A84B4B";   // = --cat-strategy     → var(--cat-strategy, #A84B4B)
const ACCENT = "#4E6CA8";   // = --cat-architecture → var(--cat-architecture, #4E6CA8)
const POP    = "#D8A33F";   // = --pop              → var(--pop, #D8A33F)
//   #3e6b6b = --cat-skills · #20264a = --ink · #f3eee4 = --paper · #f8f3e8 = --surface
```

배치2 가 `--state-*` 를 이 배치로 미뤘으나 **세우지 않는다** — 세우면 같은 값에 이름이 둘이 된다.

### 병렬 3 에서 지킬 것 — 배치4 가 실측으로 남긴 셋

1. **스크래치패드는 `scratchpad/<work>/` 네임스페이스**다. 배치4 에서 세 세션이 `measure.mjs` ·
   `shot-before/` 를 같은 이름으로 써서 측정 스크립트가 한 번 죽었고 한 세션이 남의 스냅샷을
   지웠다.
2. **같은 워크트리에서 찍은 전후 대조는 못 믿는다.** 자기 파일만 `HEAD` 로 되돌린 사본을 따로
   구워 대조한다 — 배치4 에서 한 세션의 첫 짝이 남의 변경(홈 −49px · 글 목록 −483px)을 자기
   몫으로 쟀다.
3. **`deco:verify` · `width:verify` 는 `--base` 로 자기 빌드를 물린다.** 기본값이 공유 `dist` 라
   병렬 중에는 낡은 빌드를 잰다.
