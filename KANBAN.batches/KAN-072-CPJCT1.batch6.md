---
card: KAN-072-CPJCT1
batch: 6
created: 2026-08-27
branch: KAN-072-CPJCT1
status: 계획
steps: S12, S13, S14
---

# KAN-072-CPJCT1 배치6 — 발행물 마무리 — webrtc · auth · container·tauri (병렬 3)

카드: [KAN-072-CPJCT1.md](../KANBAN.cards/KAN-072-CPJCT1.md) · 범위 `S12` · `S13` · `S14`
선행: [배치5](KAN-072-CPJCT1.batch5.md)

> **이 문서는 착수 전 계획이다.** 수행 내역은 카드 실행 문서의 「수행 내역」에 있다.

## 1. 작업 패키지

배치5 와 같은 성격이고 남은 시리즈를 마저 닫는다. 규약·완료 기준·리스크는 배치5 와 같다
(`astro preview` 인터랙션 확인 포함).

### WP1 · `S12` webrtc — 5파일 110건

`LoopbackNegotiationDemo`(37) · `SdpNegotiationStepper`(24) · `JitterBufferLab`(21) ·
`IceTraversalLab`(15) · `ParticipantScaleLab`(13). **`LoopbackNegotiationDemo` 가 `posts/**`
전체에서 가장 무거운 파일이다**(감사도 상위 1위로 꼽았다).

### WP2 · `S13` auth-authz — 4파일 69건

`AuthzMap`(21) · `PkceFlowStepper`(20) · `JwtVerifyLab`(15) · `AuthRequestLab`(13).

**`PkceFlowStepper` 는 본문 표와 값이 묶여 있다** — 스텝 라벨이 하드코딩이고 글의 "여섯 스텝"
표·프로즈 워크스루와 세 표면이 일치하도록 KAN-064 에서 맞춘 자리다(`KANBAN.md:392` 부근 기록).
색만 옮기고 라벨·번호는 안 건드린다.

### WP3 · `S14` container-anatomy · tauri — 4파일 56건

`CriCallTrace`(18) · `OverlayLab`(17) · `DigestChain`(13) · `PermissionGate`(8).

**`PermissionGate.tsx:57` 은 규약의 좋은 예로 인용된 파일이다**(`REACT_SIM_GUIDE.md` 규칙 6).
남은 8건이 그 규약을 완전히 따르게 만들면 그 인용이 실제로 참이 된다.
`var(--stroke, 1.5px)` 4건도 여기 있다 — 배치2 가 선 굵기를 2단으로 만들었으면 어느 쪽인지 다시 본다.

## 2. 의존과 순서

선행은 배치5 다. 배치5 가 정한 지배값 넷의 치환 방식을 그대로 따른다 — 같은 웨이브에 두면
여섯 세션이 같은 색을 각자 판단한다.

세 WP 사이에는 순서가 없다. 커밋 규약·기준선 갱신은 배치3 과 같다.

**단일 에이전트 안과의 대비.** 235건이라 한 세션으로도 배치 **1개**다.

## 3. 리스크

배치5 와 같고, 하나가 더 있다 — **`PermissionGate` 는 규약 문서가 인용하는 파일이라
줄 번호가 움직이면 `REACT_SIM_GUIDE.md` 의 인용이 어긋난다.** 옮겼으면 그 문서도 함께 고친다.

## 4. 착수 시점 판단
<!-- 착수할 때 채운다 — 마지막 work 를 다음 배치로 미룰지 여기서 정한다. -->
