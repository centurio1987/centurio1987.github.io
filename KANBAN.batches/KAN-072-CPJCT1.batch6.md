---
card: KAN-072-CPJCT1
batch: 6
created: 2026-08-27
branch: KAN-072-CPJCT1
status: 완료
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

**착수 2026-08-27. 세 WP 를 그대로 간다 — 미루지 않는다.**

**구획 무게를 다시 쟀다.** 계획 시점 수는 배치2 재분류 이전 값이라 낡았다.

| WP | work | 파일 | 계획 시점 | **착수 시점** |
|---|---|--:|--:|--:|
| WP1 webrtc | `S12` | 5 | 110 | **131** |
| WP2 auth-authz | `S13` | 4 | 69 | **80** |
| WP3 container·tauri·orca | `S14` | 5 | 56 | **68** |
| 합계 | | 14 | 235 | **279** |

`S14` 는 계획의 4파일이 아니라 **5파일**이다 — `orca-dev-env/Shot.astro` 1건이 더 있다(이 배치에서
유일한 `.astro` 파일이다). 파일별 상위: `LoopbackNegotiationDemo`(48) · `SdpNegotiationStepper`(27) ·
`AuthzMap`(24) · `JitterBufferLab`(24) · `PkceFlowStepper`(22) · `CriCallTrace`(20).

**미루지 않는 근거** — 배치5 가 478건을 한 웨이브에 닫았다. 279 는 그보다 가볍고 파일 수(14)도
배치5(21)보다 적다.

**배치6 이 끝나면 남는 것은 45건이다** — 마스코트 34(`S15`) + 배치5 가 판정 대기로 남긴
구분 팔레트 11. 둘 다 배치7 몫이다.

### 색 매핑 — 배치5 정본을 그대로 잇고 셋을 더한다

세션 공통 표는 `scratchpad/BATCH6_COLOR_MAP.md` 다. **유저가 판정한 것이라 세션이 다시 고르지
않는다.** 배치5 에서 정한 잉크·선·배경 매핑이 그대로 살아 있고, 이 배치에서 더해진 것이 셋이다.

| 값 | 자리 | 역할 | → | ΔRGB | 판정 |
|---|--:|---|---|--:|---|
| `#4a463f` | 12 | 부속 글자 | `var(--ink-2, #4a4f6a)` | 44 | 배치5 판정의 연장 |
| `#f3efe6` | 9 | 비활성 배경 | `var(--paper, #F3EEE4)` | 2.2 | 눈으로 못 가름 |
| `#e5f0ed` | 20 | 활성·선택·도달 배경 | `color-mix(in srgb, var(--cat-skills) 11%, var(--surface-hi))` | 7.7 | 유저 2026-08-27 |
| `#f4e3e0` | 4 | 위험·약함 배경 | `color-mix(in srgb, var(--cat-strategy) 14%, var(--surface-hi))` | 1.4 | 유저 2026-08-27 |

**상태 틴트 한 쌍을 토큰으로 안 세운 이유**(유저 판정) — `color-mix` 는 토큰을 안 늘리면서
**관계를 코드에 드러낸다.** 「이건 기술 축 색의 옅은 배경이다」가 이름이 아니라 식으로 보인다.
배치3 데코 세션이 같은 방식을 6곳에 썼고 `DECO_KIT` 규약으로 굳어 있다. 대가는 `#e5f0ed` 가
Δ7.7 로 미세하게 밝아지는 것이고, 감사 기준 「15 미만은 눈으로 못 가름」 안이다.

**`#e5f0ed` 는 배치 경계를 넘는다** — 배치5 구획에 11자리가 더 있다(삼항 안이라 게이트 시야 밖).
`S12`~`S14` 는 자기 파일만 고치고, 배치5 구획의 11자리는 **배치7 `S16` 이 같은 식으로 닫는다.**

### 이 배치에만 있는 함정 셋

1. **`PermissionGate.tsx` 는 규약 문서가 인용하는 파일이다.** `REACT_SIM_GUIDE.md:25` 가
   `posts/tauri-2/PermissionGate.tsx:57` 을 「좋은 예」로 줄 번호까지 걸고 있다 — 상수를 더해
   줄이 밀리면 그 인용이 어긋나므로 **옮겼으면 그 문서도 함께 고친다.**
2. **`PkceFlowStepper` 는 본문 표와 값이 묶여 있다.** 스텝 라벨이 하드코딩이고 글의 「여섯 스텝」
   표·프로즈 워크스루와 세 표면이 일치하도록 KAN-064 에서 맞춘 자리다. **색만 옮기고 라벨·번호는
   안 건드린다.**
3. **`var(--stroke, 1.5px)` 4건은 위반이 아니다.** 전부 `PermissionGate.tsx` 에 있고, 배치2 가
   선 굵기를 **3단**(`--stroke-hair` 1px · `--stroke` 1.5px · `--stroke-bold` 2px)으로 만들었으므로
   `--stroke` 는 지금도 살아 있는 중간 단이다. 계획 문서의 「2단으로 만들었으면 다시 본다」는
   전제가 틀렸다 — **그대로 둔다.**
