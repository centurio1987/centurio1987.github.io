---
title: 김윤덕 경력기술서 — 프로덕트 엔지니어
purpose: product-engineer
doc_type: 경력기술서
sources:
  - wiki/positioning.md
  - wiki/skills/_purpose-mapping.md
  - wiki/entities/탄소중립연구원.md
  - wiki/entities/크로노스.md
  - wiki/entities/쓰리랩스.md
  - wiki/entities/리플라이랩.md
  - wiki/projects/LynC.md
  - wiki/projects/LGSP.md
  - wiki/projects/탄중연-공통유틸리티.md
  - wiki/projects/탄중연-팀리딩.md
  - wiki/projects/크로노-V1-V2.md
  - wiki/projects/쓰리랩스-플링고-푸시재구축.md
  - wiki/projects/쓰리랩스-플링고-피드.md
  - wiki/projects/우주공간-MVP.md
  - wiki/decisions/PMF없는시장-도메인우선.md
  - wiki/decisions/코어변경-vs-Plugin아키텍처.md
  - wiki/decisions/RN-Firebase-서버리스-피벗.md
last_updated: 2026-06-05
layout: ../../../layouts/CareerLayout.astro
---

# 김윤덕 경력기술서 — 프로덕트 엔지니어

> 도메인·아키텍처·UI·데이터 추상화·디자인 시스템을 풀스택으로 책임지는 프로덕트 엔지니어.

## 핵심 역량 (프로덕트 엔지니어 가중)

- **아키텍처**: DDD · 레이어드 · 헥사고날 · Plugin 아키텍처 (DrawerPlugin + PluginManager)
- **풀스택 구현**: NestJS · TypeScript · TypeORM/Prisma · GraphQL · Vue 3 / Nuxt 3 · Next.js · React Native · Nx Monorepo
- **데이터·성능**: DataFrameTable (Pandas-like) · Xlsx Parser · Service Worker + IndexedDB Cache-First · 쿼리 최적화 · CloudFront + Lambda@Edge
- **디자인 시스템**: Atomic Design · 추상/구상 컴포넌트 분리 · 디자인 시스템 → Vue Component 컴포넌트화 · Chart 추상 컴포넌트

---

## 1. 주식회사 탄소중립연구원 — Tech Lead / TPM (2023.05 – 2025.12)

LCA(전과정평가, ISO 14040·14044) 도메인의 SaaS·DX 솔루션을 0→1로 풀스택 구현했다. 본 섹션은 *프로덕트 엔지니어 관점*에서 풀스택·도메인·UI·데이터 추상화를 중심으로 서술한다.

### 1-1. LynC — LCA 분석 SaaS (Tech Lead / TPM, 2023.06 – 2025.12)

**팀**: PO 1, TPM/PE 1, PE 3–4, 디자이너 1
**스택**: NestJS · TypeORM · PostgreSQL · GraphQL / Nuxt 3 · Vue 3 · Vite · Pinia / Nx Monorepo · Docker · AWS(S3·SES) · GitHub Actions / Jest · Vitest · Storybook

#### 단계 1: Prototype (4주)

- **맥락**: 독일 판촉 4주 데드라인. PMF 없는 시장.
- **판단**: 영속성·도메인 모델링 부담을 덜고 *프론트 중심*으로 책임 이동 → **Next.js 올인원**. 디자인 결과물로부터 기능을 식별하고 *just-in-time 모순 개선*.
- **실행**: LCA 도메인 학습(컨설턴트 질문·세션). 디자인 시안 → 시나리오 → 컨벤션·코드베이스 합의 → 코드 리뷰로 스타일 일치. 프론트엔드 계산 로직은 **커스텀 훅 + Zustand 상태 저장소**로 View에서 사용할 인터페이스 제공. 100시간+ 크런치, 회사 숙식.
- **변화**: 4주 안에 사용 가능한 MVP 완성.

#### 단계 2: 본 제품 MVP (3개월)

- **판단**: PMF에 의존할 수 없으니 *도메인 자체를 자산*으로 — "지금 만든 제품이 이후 PMF를 찾았을 때 엔진으로 재사용 가능해야 한다." 백엔드는 **DDD·레이어드 아키텍처**, 도메인 레이어를 핵심에 두어 타 레이어 최적화와 충돌 시 도메인을 우선. 설계 일관성을 위해 *두 가지 원칙 명문화* — **(1) LCA 표준 ISO 14044·14040 철저 준수, (2) Eric Evans의 DDD 이론적 내용 철저 준수**. 프론트는 **Atomic Design**으로 추상/구상 컴포넌트의 View·통신 책임을 분리.
- **실행**: 사내 LCA 컨설턴트와 반복 인터뷰로 도메인 모델링. ISO 14040·14044 이론 준수 GtG 분석, Cutoff·Impact Score 연결 시나리오를 풀스택 구현. Resolver / Service / Domain / Infra 레이어 대응 로직, 주로 핵심 도메인·연관 로직 담당.
- **기술 디테일**: 단위 공정 그래프를 **DAG 자료구조**로 추가·삭제 구현. 재귀 함수로 각 단위 공정의 탄소배출량 계산(부모 노드가 자식 노드 배출량에 영향). 도메인 설계 주도적 참여 / 배출계수 DB 페이지 / 공정관리 페이지 / LCA 분석 페이지. 추상 컴포넌트(디자인 시스템 → Vue Component)는 범용성 우선으로 인터페이스가 다소 복잡.
- **회고 — "쿼리 한 번에 로우 3억 개" 사건**: 도메인 모델=DB 스키마 직결 한계 노출. 미봉책은 aggregate root 프로퍼티 JSON 저장. 여러 해결책 후보(스키마 설계 분리·네이티브 쿼리·CQRS·eager 해제·JSON+동기화 알고리즘·도메인×디자인 교차 설계) 중 명확한 컨셉·명분 없는 미봉책이었다는 회고 → 운영 단계의 *스키마-도메인 점진 분리*로 이어짐.

#### 단계 3: 운영·업데이트 — Plugin 아키텍처

- **판단**: 고객사 커스텀 요구 급증. 코어에 직접 반영하면 변경 누적이 *비선형*으로 비용을 증가시키니, **"확장은 허용·변경은 구조적으로 차단"** 하는 [Plugin 아키텍처]. 헥사고날로 확장 지점 SoC 명확화.
- **프론트 구현**: 전역 레이아웃에 **DrawerPlugin 인터랙션** 도입. 커스텀 기능은 자체 설계한 `pluginInfo` 인터페이스와 PluginManager를 통해서만 등록되도록 강제.
  - **DrawerPlugin Vue Component**: 최소 규격 추상 컴포넌트. 구상 DrawerPlugin은 기능 구현 후 pluginInfo 오브젝트로 프롭 전달.
  - **DrawerPluginManager**: 구상 DrawerPlugin 목록을 앱에 등록하는 Vue Plugin, 전역 provide로 인터페이스 제공.
- **백엔드 구현**: NestJS 모듈 트리에서 커스텀 로직을 코어 도메인과 *완전 격리* (Monorepo).
- **고객사 적용**: '승인 결재 프로세스', '담당자 요청 관리'를 코어 변경 없이 Drawer Plugin으로 풀스택 구현·배포. 대응 백엔드 모듈도 동일 격리 규칙.

### 1-2. LGSP — 온실가스 감축 목표관리 DX 솔루션 (Tech Lead & Full-stack / TPM, 2024.08 – 2025.12)

**스택**: NestJS · GraphQL(Apollo) · PostgreSQL · Prisma / Vue 3 · Pinia · Vite / Service Worker · IndexedDB · ExcelJS · Chart.js / Layered Architecture · JWT · CASL(RBAC) · PWA

#### 구축 (2024.08 – 2024.10)

- **맥락**: 수동 Excel로 처리되던 다단계 온실가스 계산을 디지털 전환. 원시 데이터(전력·연료) → 다단계 계산(배출계수 곱·재구조화·부서별 분배) → 시각화. **레거시 로직 100% 보존** 필수.
- **판단**: 로직 재정의 대신 *기존 Excel 구조를 그대로 시스템 도메인에 매핑*. MVP 단계라 과도한 아키텍처 대신 **배치 프로세스 + 함수 체이닝**으로 기민·안정 균형. 레이어드, 스키마-로직 분리, 쿼리 빌더로 SQL-like Query 활용 위해 Prisma 채택. 백엔드는 기본 CRUD, 프론트에 차트용 집계 연산 책임 할당.
- **실행**:
  - **ETL 파이프라인** — SoC 기준 설계, 함수 체이닝.
  - **DataFrameTable** — Python Pandas DataFrame 개념 차용. 셀/행/열 참조, column/row reduce, element-wise 연산, sub-table 추출 인터페이스.
  - **Xlsx Parser** — ExcelJS 기반 유스케이스 최적화 파서, 셀·테이블의 *스타일까지 식별*하는 스캐닝.
  - **Xlsx → DataFrameTable Transformer**.
  - 비즈니스 로직: Vue 페이지·컴포넌트, API, Data Access 전반.

#### 운영·업데이트 (2024.08 – 2025.12)

- **맥락**: 주 단위 고객사 피드백. 연말 메이저 업데이트(성능 개선, 원시 데이터 종류 추가, Sankey 차트 등). 대시보드 대량 데이터 패칭 병목·서버 트래픽 우려.
- **판단**: 단순 캐싱을 넘어 클라이언트가 *부족한 데이터만* 식별 요청 → **네트워크 페이로드 자체를 줄이는** 방향. 성능 최적화를 위해 엑셀 로직과 다른 *독자 로직*(같은 결과, 불필요 과정 배제). 일부 연산 책임 클라이언트 → 백엔드로 이전, DB 쿼리 최적화.
- **실행**:
  - **Service Worker + IndexedDB 캐시 동기화**. Cache-First 계층. IndexedDB 우선 조회 후 캐시 미스에만 서버에 요청하는 **Wrapper Client** 구현.
  - 누락 데이터의 '연/월 리스트'만 인코딩해 일괄 요청. 통신 경로로 **HTTP·Socket 모두** 제공.
  - **레거시 엑셀 Transformer 추가 구현**: 특정 연도 이전 데이터 시스템 이전용(기존 Xlsx 형식과 달라 별도 제작). 마이그레이션 완료.
- **변화**: 중복 서버 API 호출 크게 감소, 대용량 차트 렌더링 속도·UX 개선.

### 1-3. 공통 유틸리티 (Tech Lead · PE 3, 2023.05 – 2025.12)

구현 중 반복되는 기능을 식별·공통화·패키지화. 제공:

- **Date 확장** — `format` 등 (Python 참고).
- **Array 확장** — `zip`, `min`, `max`, `range` (Python 참고).
- **Error 확장** — error code · 함수 · 클래스명 · 메시지 구조화.
- **i18n 모듈** — locale 사전 등록·키 조회.
- **Cursor Pagination Manager** — 컬럼·값 key-value array → 인코딩, 요청 시 디코딩 + where 파싱.
- **Infinity Scroll List 추상 컴포넌트** — IntersectionObserver, factory props.
- **Chart 추상 컴포넌트** — Chart.js Vue 래핑 + prop Builder.

팀의 반복 구현 비용 감소, 제품 간 품질 편차 감소. [Product Engineer 육성] 맥락과 직결.

---

## 2. 주식회사 크로노스 — Product Engineer / Tech Lead (CTO, 2022.05 – 2023.04)

### 2-1. 크로노 V2 — 시세·거래 (Tech Lead 1인, 2023.02 – 2023.04)

**스택**: TypeScript · Vue · NestJS · PostgreSQL · TypeORM · CloudFront · Lambda@Edge · sharp

- **맥락**: 고가 시계 온라인 시세 파악 어려움. 1인 개발로 빠른 시장 진입.
- **판단·실행**: 불필요 공정 생략, 레퍼런스 역기획 → 프로토타입 → 직접 테스트로 점진 개선. 제품 컨셉·시안·시나리오, 제품 등록/관리·유저 관리 Admin.
- **이미지 응답 속도 문제 해결**: 원본 이미지 사용 시 응답 속도 악영향 → **CloudFront + Lambda@Edge + sharp**로 썸네일 최적화. 요청 파라미터별 캐시 히트 시 즉시 제공, 미스 시 엣지에서 처리·전송 후 캐시 등록 구조.

### 2-2. 크로노 V1 — 조각 투자 (Product Engineer, 2022.06 – 2022.11)

소자본 진입 장벽이 있는 고가 시계 재테크의 소유권 지분 분할 판매 플랫폼. 신뢰성 확보를 위해 **복식부기 장부 개념**을 도메인에 도입. 레퍼런스 기반 디자인 시안, 복식부기 기반 도메인·시퀀스 다이어그램 설계, BM 검증용 프론트엔드 프로토타입.

---

## 3. 쓰리랩스 — Backend Engineer (2021.10 – 2022.05)

### 3-1. 플링고 피드 (Backend, 2021.11 – 2021.12)

- 회사·크리에이터가 짧은 영어 학습 콘텐츠를 발행하는 피드 기능 추가.
- 기획안 기반 **피드 모델 정의**, CRUD 중심 API. 일반/관리자 앱 유스케이스 각각 분리 고려.

### 3-2. 플링고 푸시 재구축 (Backend, 2022.03)

- 기존 푸시가 대량 발송 시 서버 다운·메시지 누락.
- 운영 중단 위험을 피하기 위해 *근본 구조 변경 대신 전략적 기능 추가*로 우회 — 발송 대상 그룹화·예약 발송·데이터 메시지 전송 (Express·MongoDB·Mongoose·FCM).

---

## 4. 주식회사 리플라이랩 — 개발 리드 (2021.04 – 2021.08)

### 4-1. 우주공간 MVP (TPM / Tech Lead, 2021.05)

**스택**: React Native · Firebase · AWS Lambda · JavaScript

- **맥락**: 외주 인수, 남은 기간 **2주**.
- **판단·실행**: 속도를 위해 RN+Firebase 시도. RN의 Firebase 이슈를 만나자 *백엔드를 분리해 RN의 환경 의존을 회피*하는 **AWS Lambda 서버리스**로 즉시 선회. RN은 UI·통신만 담당. 우주공간 랜딩 페이지는 Vanilla Web·S3 정적 배포.
- **변화**: 일정 내 MVP 완성. 메인 플로우 중심 개발로 적재된 버그 수정 추가 시간 — 이후 *안전장치·코드 컨벤션 중시*의 계기.

---

## 학력·자격

- 숭실대학교 대학원 소프트웨어학과 (2015.03–2017.02 졸업)
- 한국산업기술대학교 컴퓨터공학과 (2006.03–2014.02 졸업)
- TOPCIT 육군참모총장 특별상 485점 · 정보처리기사 · JLPT N1 · TOEIC 915 (만료)
- AWS Technical Essentials / Big Data on AWS / Deep Learning on AWS (2020.08–09)
