---
card: KAN-072-CPJCT1
batch: 5
created: 2026-08-27
branch: KAN-072-CPJCT1
status: 계획
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
여기가 오케스트레이션의 이득이 가장 큰 자리다 — 시리즈가 서로 완전히 독립이고
(파일도 글도 안 겹친다) preview 확인도 시리즈별로 따로 난다.

## 3. 리스크

- **발행된 글이 바뀐다.** 화면이 달라지면 독자가 보는 것이 달라진다. 색을 옮기는 것이지
  고르는 것이 아니므로 **ΔRGB 가 큰 치환은 그 자리에서 멈추고 기록한다.**
- **fallback 을 토큰 값과 어긋나게 적으면 fallback 칸이 는다**(위 규약). 가장 흔한 실수다.
- **시뮬이 조건부로 색을 고른다** — `${cond ? "#fff" : "#000"}` 꼴이 있으면 정규식이 리터럴로만
  잡고 어느 상태에서 쓰이는지는 안 남는다(감사 §6-4). 그래서 preview 조작 확인이 필수다.
- 되돌리기: 시리즈별 커밋이라 글 하나 단위로 되돌릴 수 있다.

## 4. 착수 시점 판단
<!-- 착수할 때 채운다 — 마지막 work 를 다음 배치로 미룰지 여기서 정한다. -->
