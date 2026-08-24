---
card: KAN-070-DRF0QF
batch: 2
created: 2026-08-25
branch: KAN-070-DRF0QF
status: 계획
steps: S2, S9
---

# KAN-070-DRF0QF 배치2 — 계약을 먼저 박는다 — 스켈레톤과 규칙 개정 (병렬 2)

카드: [KAN-070-DRF0QF.md](../KANBAN.cards/KAN-070-DRF0QF.md) · 범위 `S2` · `S9`
선행: [배치1](KAN-070-DRF0QF.batch1.md)

> **이 문서는 착수 전 계획이다.** 수행 내역은 카드 실행 문서의 「수행 내역」에 있다.

## 1. 작업 패키지

### WP1 · `S2` 진입점 스켈레톤과 축 모듈 공통 계약

`scripts/verify-tokens.ts` 를 레포 게이트 규약대로 세운다. 아직 아무것도 판정하지 않는다.
**그런데 이 배치의 진짜 산출물은 스켈레톤이 아니라 계약이다** — 배치3 의 세 축이 병렬로
돌려면 무엇이 공통인지가 먼저 서 있어야 한다.

진입점이 지는 것(축 모듈은 안 진다):
- `#!/usr/bin/env bun` 셰뱅 · 머리주석이 **"왜 필요한가"**부터(빌드도 타입도 초록이라 눈
  말고는 안 잡힌다) · `failures[]`/`notes[]` 분리(`scripts/verify-graph.ts:74-75` 미러) ·
  `console.error("고치는 법: …")` · `process.exit(1)`.
- **토큰 사전** — `src/styles/tokens.css` 를 파싱해 값→토큰 맵을 만든다. 문서는 안 읽는다.
- **파일 목록과 제외 규칙** — 감사와 똑같은 파일집합(`.astro`·`.tsx`·`.css`)에서
  `AUTO-GENERATED` 헤더 파일 41개 · `src/styles/motion.css` · `src/styles/viz.css` · `tokens.css` 자신을 뺀다.
- **타입** — `Hit` 와 `Verdict`. 축 모듈 시그니처는 `scan(files: string[], dict: TokenDict): Hit[]` 하나다.

**완료 기준**
- `bun scripts/verify-tokens.ts` 가 0 으로 끝나고 "검사 0건"을 보고한다.
- 축 모듈 셋(`scripts/lib/tokens/{color,fallback,docrule}.ts`)이 **빈 구현으로 존재**하고
  진입점이 그것을 불러 모은다. 배치3 의 세 세션이 서로의 파일을 안 연다.
- 제외 규칙이 진입점 한 곳에만 있다 — 축 모듈이 각자 파일을 훑으면 규칙이 세 벌이 된다.

### WP2 · `S9` 판정 불가능한 규칙을 판정 가능한 말로

`.claude/skills/react-sim/assets/REACT_SIM_GUIDE.md:19` 의 "색은 `src/styles/tokens.css`
팔레트와 **조화**"를 바꾼다. 준수율 3.6% 구획이 그 "조화" 아래에서 만들어졌다 — 판정할 수
없는 낱말은 규칙이 아니다.

**완료 기준**
- 두 문서(`REACT_SIM_GUIDE.md` · `CLAUDE.md`)에서 "조화"·"어울리게" 류가 0건이다.
- 좋은 예로 `src/components/posts/tauri-2/PermissionGate.tsx:57-58`
  (`const PASS = "var(--cat-planning, #3E6B4F)"`)을 인용한다 — 시뮬 저자 하나가 이미 이렇게 풀었다.
- **자급식 원칙(같은 가이드 10행 "글마다 자기 폴더 = 공용 라이브러리 아님")은 그대로 둔다.**
  공용 팔레트 모듈을 만들지 않는다.
- `CLAUDE.md` 시각 규칙 절에 `tokens:verify` 가 다른 게이트와 나란히 적힌다.

## 2. 의존과 순서

- **WP1 → 배치3 전체.** 축 모듈의 계약이 여기서 정해진다.
- **WP1 ‖ WP2 — 서로 안 기다린다.** `S9` 는 문서 둘만 고치고 게이트 코드를 안 건드린다.
  그래서 `S2` 가 혼자 있지 않고 이 배치에 함께 왔다.
- 배치1(`S1`) 이 끝나 있어야 한다 — 진입점이 참조 JSON 경로를 가리킨다.

## 3. 리스크

- **계약을 덜 박고 배치3 에 넘기는 것이 이 배치의 유일한 실패 모드다.** 축마다 다른 세션이
  제외 규칙이나 `Hit` 모양을 스스로 정하면 판정 규칙이 미묘하게 갈리고, 그 어긋남은
  히트 단위 대조에서야 드러난다. 대조가 세 번이라 어느 축이 틀렸는지는 보이지만,
  고치는 비용은 배치3 한복판에 떨어진다.
- **`scripts/lib/` 라는 자리가 이 레포에 없다.** 기존 `verify-*.ts` 다섯은 전부 단일 파일이다.
  새 관례를 만드는 것이므로 `verify-tokens.ts` 머리주석에 그 사실과 이유(축 병렬)를 적는다.
- 되돌리기: 파일 넷 추가와 문서 두 곳 수정. `S9` 는 문서라 되돌리기가 싸다.

## 4. 착수 시점 판단

<!-- 착수할 때 채운다 — 마지막 work 를 다음 배치로 미룰지 여기서 정한다. -->
