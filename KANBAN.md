# KANBAN — centurio1987.github.io

> hyper plan 보드. 앱 기능 백로그가 아니라 프로젝트 차원의 계획을 유저·AI가 공동 관리한다.
> 카드 메타(생성/최종/갱신)는 manage-kanban 스킬이 관리한다. 규칙은 스킬 SKILL.md를 따른다.

## 백로그
<!-- 아직 착수 결정 전. 우선순위 미정 후보 풀. 백로그→할 일 이동이 "할지 고민" → "하기로 확정" 전환점. -->
- `KAN-007` Tauri 소개와 구현 예시 — 생성:ai · 최종:ai · 갱신:2026-06-30
  - 메모: 앱 개발자용 개념·구조 설명 + 주요 개념 두루 쓰는 예시 프로젝트 구현기 포함
- `KAN-008` OCI, CRI — 생성:ai · 최종:ai · 갱신:2026-06-30
  - 메모: Docker 구성요소·개념 설명 + Docker 대안들 설명·구성요소 + Docker와 다면 비교
- `KAN-012` 인증·인가 해부 4편 — 실무 베스트 프랙티스 — 생성:ai · 최종:ai · 갱신:2026-07-22
  - 메모: KAN-009 시리즈. 베스트프랙티스 목록+실습(4-1 nginx auth_request+redis, 4-2 BFF+refresh rotation)+인가모델(RBAC/ABAC)+위협대응. ❌/✅ 비교.

## 할 일

## 진행 중
- `KAN-006` WebRTC 이해와 최적 활용 사례 — 생성:ai · 최종:ai · 갱신:2026-06-30
  - 메모: webrtc-1.mdx 발행됨, 시리즈 진행 중
- `KAN-009` 인증, 인가 주요 개념과 구현 실습 — 생성:유저 · 최종:ai · 갱신:2026-07-22
  - 메모: 시리즈 「인증·인가 해부」로 진행. 1편 「지형도」 이번 세션 발행. 개념 인벤토리 A~H + 베스트프랙티스 10항 확정(플랜: snug-gathering-gizmo). 2~4편은 KAN-010~012.
  - 원문:
    ```text
    인증, 인가 주요 개념과 구현 실습
    - pkce, jwks 등 주요 개념을 설명한다.
      - 시나리오를 묘사한다. 각 절차에서 어떤 데이터가 오가고 왜 오가는지 설명. 데이터는 추상화된 형식이 아니라 실제 형식을 제시한다.
    - 주요 사례를 실제 적용하는 베스트 프랙티스와 실습 예제를 제공하고 설명한다.
      - ex. SSO를 nginx reverse proxy에 구축, session id와 redis를 사용해서 보안과 트래픽을 최적화 하는 인증, 인가 하는 시나리오, OIDC 표준에 따라, 인가 하는 시나리오
    ```

## 검토
- `KAN-001` GraphQL을 썼을 때 유리한 상황과 아닌 상황 — 생성:ai · 최종:ai · 갱신:2026-06-30
  - 메모: draft: draft/graphql-use-cases-draft.md · REST 대비 이득/복잡도 증가 상황, 조직·클라이언트·게이트웨이 판단 기준
- `KAN-002` 도메인 모델과 RDB — 생성:ai · 최종:ai · 갱신:2026-06-30
  - 메모: draft: draft/domain-model-rdb-draft.md · 외래키 신호, 상속/합성 테이블 표현, Aggregate↔테이블 대응, Value 영속화
- `KAN-003` DDD에서 Composition과 Aggregation — 생성:ai · 최종:ai · 갱신:2026-06-30
  - 메모: draft: draft/ddd-composition-aggregation-draft.md · Composition=의존 생명주기/Aggregate 소속, Aggregation=참조
- `KAN-004` 상속이냐 Composite냐 — 생성:ai · 최종:ai · 갱신:2026-06-30
  - 메모: draft: draft/inheritance-vs-composition-draft.md · 대부분 Composite 권장, 상속 고려 상황, Evolving 관점
- `KAN-005` 모델링 철학 고려 사항 — 생성:ai · 최종:ai · 갱신:2026-06-30
  - 메모: draft: draft/modeling-philosophy-draft.md · 속성 우연일치≠동일모델, 내러티브 중심. 모델 구분 기준 보강 필요
- `KAN-010` 인증·인가 해부 2편 — 토큰과 검증 — 생성:ai · 최종:ai · 갱신:2026-07-22
  - 메모: 2편 발행 완료: src/content/posts/auth-authz-2.mdx (JWT/JWS/JWKS·서명검증 6단계·alg none/confusion·opaque vs JWT·DPoP/mTLS). JwtVerifyLab 시뮬. 빌드 통과.
- `KAN-011` 인증·인가 해부 3편 — 플로우 — 생성:ai · 최종:ai · 갱신:2026-07-22
  - 메모: 3편 발행 완료: src/content/posts/auth-authz-3.mdx (Authorization Code+PKCE·프론트/백채널·state/nonce·OIDC 로그인·client auth·PAR). PkceFlowStepper 시뮬. 빌드 통과.

## 완료
