---
title: 김윤덕 포트폴리오 — 프로덕트 엔지니어
purpose: product-engineer
doc_type: 포트폴리오
sources:
  - wiki/positioning.md
  - wiki/skills/_purpose-mapping.md
  - wiki/projects/LynC.md
  - wiki/projects/LGSP.md
  - wiki/projects/탄중연-공통유틸리티.md
  - wiki/projects/크로노-V1-V2.md
  - wiki/projects/우주공간-MVP.md
  - wiki/decisions/PMF없는시장-도메인우선.md
  - wiki/decisions/코어변경-vs-Plugin아키텍처.md
  - wiki/decisions/RN-Firebase-서버리스-피벗.md
last_updated: 2026-06-05
layout: ../../../layouts/CareerLayout.astro
---

# 포트폴리오 — 프로덕트 엔지니어

> 도메인·아키텍처·UI·데이터 추상화·디자인 시스템을 풀스택으로 책임지는 프로덕트 엔지니어.

## 기술 스택 한눈에

- **Backend**: NestJS · TypeScript · PostgreSQL (TypeORM / Prisma) · GraphQL · Express · MongoDB · AWS Lambda
- **Frontend**: Vue 3 / Nuxt 3 · Next.js · Pinia · Vite · React Native · Atomic Design
- **Data·Performance**: ExcelJS · IndexedDB · Service Worker · CloudFront · Lambda@Edge · sharp · MQTT · Elasticsearch
- **Infra (보조)**: Kubernetes · Terraform · GitHub Actions GitOps · AWS (ECS · CloudFront · S3 · SES)
- **Methodology**: DDD · 레이어드 · 헥사고날 · Plugin 아키텍처 · Atomic Design

---

## 1. LynC — DDD + Plugin 아키텍처로 완성한 LCA 분석 SaaS

> 단계별 의도적 아키텍처 분기로 0→1에서 1.5년+ 운영까지.

[시각 자료]
- 단계별 아키텍처 비교 (Prototype Next.js / MVP DDD 레이어드 / 운영 헥사고날 + Plugin)
- DrawerPlugin · DrawerPluginManager 등록 흐름도
- 단위 공정 그래프 DAG 시각화 (React Flow)
- 모노레포 모듈 트리

### 풀스택 디테일

- **NestJS · TypeORM · PostgreSQL · GraphQL** 백엔드. Resolver/Service/Domain/Infra 레이어 대응 로직.
- **Nuxt 3 · Vue 3 · Vite · Pinia** 프론트. **Atomic Design** 추상/구상 컴포넌트 분리.
- **Nx Monorepo** + Docker + GitHub Actions.
- **테스트**: Jest · Vitest · Storybook.

### 도메인 추상화

- ISO 14040·14044 준수 GtG 분석, Cutoff·Impact Score 연결.
- 단위 공정 그래프를 **DAG 자료구조**로 추가·삭제, 재귀 함수로 탄소배출량 계산(부모→자식 영향).
- 도메인 설계 주도 / 배출계수 DB / 공정관리 / LCA 분석 페이지.

### Plugin 아키텍처 구현

| 컴포넌트 | 역할 |
|----------|------|
| `DrawerPlugin` Vue Component | 최소 규격 추상 컴포넌트. 구상 DrawerPlugin은 기능 구현 후 `pluginInfo` 프롭 전달 |
| `DrawerPluginManager` Vue Plugin | 구상 DrawerPlugin 목록을 앱에 등록, 전역 provide로 인터페이스 제공 |
| NestJS 모듈 트리 | 커스텀 로직을 코어 도메인과 *완전 격리* (Monorepo) |

고객사 적용: '승인 결재 프로세스', '담당자 요청 관리'를 코어 변경 없이 Drawer Plugin으로 풀스택 구현·배포.

### 단계별 의도적 분기

> "지금 만든 제품이 이후 PMF를 찾았을 때 *엔진으로 재사용 가능*해야 한다."

| 단계 | 아키텍처 | 강조 |
|------|----------|------|
| Prototype (4주) | Next.js 올인원 + NestJS 골조 | 프론트 중심, just-in-time 모순 개선 |
| 본 제품 MVP (3개월) | DDD·레이어드 | 도메인 자산화 |
| 운영·업데이트 (1.5년+) | 헥사고날 + Plugin | 코어 동결, 확장 격리 |

---

## 2. LGSP — DataFrameTable + Service Worker Cache-First

> 레거시 Excel 로직 100% 보존 + 클라이언트 사이드 캐시 동기화.

[시각 자료]
- ETL 파이프라인 도식
- DataFrameTable 개념도 (Pandas-like 인터페이스)
- Xlsx Parser 스타일 식별 흐름
- Cache-First 데이터 흐름 (클라이언트 ↔ IndexedDB ↔ 서버, HTTP/Socket)

### 자체 데이터 추상화

- **DataFrameTable** — Python Pandas DataFrame 개념 차용. 셀/행/열 참조, column/row reduce, element-wise 연산, sub-table 추출 인터페이스.
- **Xlsx Parser** — ExcelJS 기반 유스케이스 최적화 파서. 셀·테이블의 *스타일까지 식별*하는 스캐닝.
- **Xlsx → DataFrameTable Transformer** — 비정형 Excel → 일관된 시스템 데이터.

### 캐시 동기화 (운영 단계)

- **Service Worker + IndexedDB Cache-First Wrapper Client** — IndexedDB 우선 조회 후 캐시 미스에만 서버에 요청.
- 누락 데이터의 '연/월 리스트'만 인코딩해 일괄 요청.
- 통신 경로: HTTP·Socket 모두 제공.
- 일부 연산 책임을 클라이언트 → 백엔드로 이전, DB 쿼리 최적화.

### 풀스택 디테일

**Vue 3 · Pinia · Vite · ExcelJS · Chart.js · Service Worker · IndexedDB · PWA / NestJS · GraphQL(Apollo) · PostgreSQL · Prisma · CASL(RBAC) · JWT** · Layered Architecture.

레거시 엑셀 Transformer 추가 구현 (특정 연도 이전 데이터 시스템 이전용).

---

## 3. 탄중연 공통 유틸리티 — 디자인 시스템·추상 컴포넌트·헬퍼

> 반복 구현 비용 감소 + 제품 간 품질 편차 감소를 위한 내부 npm 패키지.

[시각 자료]
- 패키지 의존 그래프
- Chart 추상 컴포넌트 prop Builder 흐름도
- Infinity Scroll List 추상 컴포넌트 IntersectionObserver 흐름

### 제공 패키지

| 패키지 | 핵심 |
|--------|------|
| Date 확장 | `format` 등 (Python 참고) |
| Array 확장 | `zip`, `min`, `max`, `range` (Python 참고) |
| Error 확장 | error code · 함수 · 클래스명 · 메시지 구조화 |
| i18n 모듈 | locale 사전 등록·키 조회 |
| Cursor Pagination Manager | 컬럼·값 key-value array → 인코딩, 디코딩 + where 파싱 |
| Infinity Scroll List 추상 컴포넌트 | IntersectionObserver, factory props |
| Chart 추상 컴포넌트 | Chart.js Vue 래핑 + prop Builder |

각자가 더 넓은 책임을 지는 Product Engineer 팀에서 공통 부품의 비중이 커지는 것이 자연스러운 흐름. 팀의 반복 구현 비용 감소, 제품 간 품질 편차 감소.

---

## 4. 크로노 V2 — 1인 풀스택 + CloudFront/Lambda@Edge 썸네일

> 1인 개발 효율 극대화 + 이미지 응답 속도 문제 엣지 캐싱으로 해결.

[시각 자료]
- CloudFront + Lambda@Edge + sharp 썸네일 캐시 흐름
- Admin/일반 페이지 IA

### 구현

- **TypeScript · Vue · NestJS · PostgreSQL · TypeORM** 풀스택 (1인).
- 제품 컨셉·시안·시나리오 작성, 제품 등록/관리·유저 관리 Admin 구현.
- 레퍼런스 역기획 → 프로토타입 → 직접 테스트로 점진 개선.

### 이미지 응답 속도 문제

- 원본 이미지 사용 시 응답 속도 악영향.
- **CloudFront + Lambda@Edge + sharp**로 썸네일 최적화.
- 요청 파라미터별 캐시 히트 시 즉시 제공, 미스 시 엣지에서 처리·전송 후 캐시 등록.

### V1 — 조각 투자 (PE, 2022.06 – 2022.11)

소자본 진입 장벽이 있는 고가 시계 재테크의 소유권 지분 분할 판매. 신뢰성 확보를 위해 **복식부기 장부 개념**을 도메인에 도입. 레퍼런스 기반 디자인 시안, 복식부기 기반 도메인·시퀀스 다이어그램 설계, BM 검증용 프론트엔드 프로토타입.

---

## 5. 우주공간 MVP — 2주 데드라인 서버리스 피벗

> RN+Firebase 막힘 → AWS Lambda 서버리스로 즉시 선회.

[시각 자료]
- 피벗 전/후 아키텍처 비교 (RN+Firebase vs RN+Lambda)

### 의사결정

- 외주 인수, 남은 기간 **2주**.
- 속도를 위해 RN+Firebase 시도. RN의 Firebase 이슈로 막히자 *백엔드 분리해 RN의 환경 의존을 회피*하는 **AWS Lambda 서버리스**로 즉시 선회.

### 결정 기준

> "데드라인이 2주이므로 막힌 곳을 우회하는 비용 < 막혀서 잃는 시간 비용."

### 실행

- 핵심 로직을 Lambda 함수로 재구현.
- RN은 UI·통신만 담당.
- 우주공간 랜딩 페이지(2021.06)는 Vanilla Web · S3 정적 배포.
- GitOps 배포 자동화·개발 프로세스 정의.

— 본 포트폴리오는 wiki/projects/, wiki/decisions/, wiki/concepts/ 페이지에서 query·정렬해 작성됨.
