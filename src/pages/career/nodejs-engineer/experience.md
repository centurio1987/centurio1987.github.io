---
title: 김윤덕 경력기술서 — Node.js 엔지니어
purpose: nodejs-engineer
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
  - wiki/projects/크로노-V1-V2.md
  - wiki/projects/쓰리랩스-플링고-푸시재구축.md
  - wiki/projects/쓰리랩스-메트릭수집.md
  - wiki/projects/쓰리랩스-플링고-피드.md
  - wiki/projects/쓰리랩스-인프라최적화.md
  - wiki/projects/우주공간-MVP.md
  - wiki/decisions/PMF없는시장-도메인우선.md
  - wiki/decisions/코어변경-vs-Plugin아키텍처.md
  - wiki/decisions/RN-Firebase-서버리스-피벗.md
last_updated: 2026-06-05
layout: ../../../layouts/CareerLayout.astro
---

# 김윤덕 경력기술서 — Node.js 엔지니어

> NestJS·TypeORM·Prisma·GraphQL·Express로 도메인 모델링·쿼리 최적화·스키마 분리·메시징·서버리스를 풀스택 책임지는 백엔드 엔지니어.

## 핵심 역량 (Node.js 가중)

- **런타임 / 프레임워크**: NestJS · TypeScript · Express · Apollo GraphQL · AWS Lambda
- **데이터 액세스**: TypeORM · Prisma · Mongoose · PostgreSQL · MongoDB · Redis · IndexedDB
- **메시징·관측**: MQTT · EMQX · Elasticsearch · Logstash · Filebeat · Kibana
- **아키텍처**: DDD · 레이어드 · 헥사고날 · Plugin · 스키마-도메인 점진 분리 · CASL RBAC · JWT

---

## 1. 주식회사 탄소중립연구원 — Tech Lead / TPM (2023.05 – 2025.12)

LCA 도메인의 SaaS·DX 솔루션을 NestJS/TypeORM/Prisma/GraphQL 스택으로 0→1 구축. 본 섹션은 *백엔드 관점*에서 정리.

### 1-1. LynC — LCA 분석 SaaS 백엔드 (Tech Lead / TPM, 2023.06 – 2025.12)

**스택**: NestJS · TypeORM · PostgreSQL · GraphQL · Nx Monorepo · Docker · AWS(S3·SES) · Jest

#### Prototype (4주, 2023.06)

영속성·도메인 모델링 부담을 덜고 *프론트 중심*으로 책임 이동했지만, 백엔드도 NestJS 골조 + 재활용성 배제 API 중심으로 설계. Next.js API 핸들러는 숙련도 위험으로 배제하고 NestJS 분리 유지.

#### 본 제품 MVP (3개월, 2024.03 – 2024.06) — DDD·레이어드

- **판단**: PMF 없는 시장에서 *도메인 자체를 자산*화. 결정 기준: "지금 만든 제품이 이후 PMF를 찾았을 때 *엔진으로 재사용 가능*해야 한다." 설계 일관성을 위해 *두 가지 원칙 명문화*: **(1) LCA 표준 ISO 14044·14040 철저 준수, (2) Eric Evans의 DDD 이론적 내용 철저 준수** — 경험적 차용이 아니라 *원전 기준의 일관성 정렬*.
- **실행**:
  - Resolver / Service / Domain / Infrastructure 4-layer 레이어드 아키텍처.
  - 도메인 레이어를 핵심에 두어 타 레이어 최적화와 충돌 시 *도메인을 우선*.
  - 사내 LCA 컨설턴트와 반복 인터뷰로 도메인 모델링. ISO 14040·14044 준수.
  - GtG(Gate-to-Gate) 분석, Cutoff·Impact Score 연결 시나리오를 GraphQL로 expose.
  - 단위 공정 그래프를 **DAG 자료구조**로 표현, 재귀 함수로 각 단위 공정의 탄소배출량 계산(부모 노드가 자식 노드 배출량에 영향).
- **회고 — "쿼리 한 번에 로우 3억 개"**: 도메인 모델 = DB 스키마 직결의 한계. 1:N 중첩 폭증. 미봉책은 aggregate root 프로퍼티 JSON 저장. 회고의 대안 후보: 스키마 설계 분리·네이티브 쿼리·CQRS·eager 해제·JSON+동기화 알고리즘·도메인×디자인 교차 설계 — 당시엔 명확한 컨셉·명분 없는 미봉책. 이 경험이 운영 단계의 *스키마-도메인 분리*로 이어짐.

#### 운영 — 헥사고날 + Plugin 격리

- **판단**: 고객사 커스텀 요구 급증. 코어 직접 반영의 비선형 비용 회피 → *확장은 허용·변경은 차단*하는 Plugin 아키텍처. 헥사고날로 확장 지점 SoC 명확화.
- **백엔드 구현**:
  - NestJS 모듈 트리에서 커스텀 로직을 코어 도메인과 *완전 격리* (Monorepo).
  - 코어 모듈에는 변경 없이 별도 Plugin 모듈로 '승인 결재 프로세스', '담당자 요청 관리' 풀스택 구현.
  - **DB 스키마를 도메인 모델과 *독립적으로 점진 분리*** — 쿼리 성능 확보. 영속성 모델과 도메인 모델 사이의 매핑 레이어 두기.

### 1-2. LGSP — DX 솔루션 백엔드 (Tech Lead & Full-stack / TPM, 2024.08 – 2025.12)

**스택**: NestJS · GraphQL(Apollo) · PostgreSQL · Prisma · CASL(RBAC) · JWT

#### 구축

- **판단**:
  - Excel 로직을 그대로 시스템 도메인에 매핑.
  - MVP라 과도한 아키텍처 대신 **배치 프로세스 + 함수 체이닝**으로 기민·안정 균형.
  - 레이어드 아키텍처, 스키마 설계를 로직과 분리.
  - 쿼리 빌더로 SQL-like Query 활용 위해 **Prisma 채택**.
  - 백엔드는 기본 CRUD, 프론트에 차트용 집계 연산 책임 할당.
- **실행**:
  - **ETL 파이프라인** — SoC 기준 설계, 개념적으로 각 파이프라인을 구분. 함수 체이닝으로 MVP 일정 충족.
  - **DataFrameTable** — Pandas-like 인터페이스(셀/행/열 참조, column/row reduce, element-wise 연산, sub-table 추출).
  - **Xlsx Parser** — ExcelJS 기반 스타일까지 식별하는 스캐너.
  - **Xlsx → DataFrameTable Transformer**.

#### 운영·업데이트

- **판단**: 단순 캐싱을 넘어 클라이언트가 *부족한 데이터만* 식별 요청 → **네트워크 페이로드 자체를 줄이는** 방향. 일부 연산 책임을 클라이언트 → 백엔드로 이전, DB 쿼리 최적화.
- **실행**:
  - **Service Worker + IndexedDB Cache-First Wrapper Client** (HTTP·Socket 모두 제공).
  - 누락 데이터의 '연/월 리스트'만 인코딩해 일괄 요청.
  - 레거시 엑셀 Transformer 추가 구현·마이그레이션 완료.
- **변화**: 중복 서버 API 호출 크게 감소.

### 1-3. 공통 유틸리티 (Tech Lead · PE 3, 2023.05 – 2025.12)

- **Date·Array·Error 확장** — Python 참고.
- **i18n 모듈** — locale 사전 등록·키 조회.
- **Cursor Pagination Manager** — 컬럼·값 key-value array → 인코딩, 요청 시 디코딩 + where 파싱.
- 팀의 백엔드 반복 구현 비용 감소.

---

## 2. 주식회사 크로노스 — CTO (2022.05 – 2023.04)

### 2-1. 크로노 V2 백엔드 (Tech Lead 1인, 2023.02 – 2023.04)

**스택**: TypeScript · NestJS · PostgreSQL · TypeORM · CloudFront · Lambda@Edge · sharp

- 제품 등록/관리·유저 관리 Admin API.
- **이미지 응답 속도 문제 해결**: 원본 이미지 응답 속도 악영향 → **CloudFront + Lambda@Edge + sharp**로 썸네일 최적화. 요청 파라미터별 캐시 히트 시 즉시 제공, 미스 시 엣지에서 처리·전송 후 캐시 등록. *백엔드에서 엣지로 책임 이동*해 메인 서버 부담 감소.

### 2-2. 크로노 V1 — 조각 투자 (PE, 2022.06 – 2022.11)

신뢰성 확보를 위해 **복식부기 장부 개념**을 도메인에 도입. 복식부기 기반 도메인·시퀀스 다이어그램 설계.

---

## 3. 쓰리랩스 — Backend / Infrastructure Engineer (2021.10 – 2022.05)

**제품**: 플링고. **스택**: Express · MongoDB · Mongoose · React Native · ECS · MQTT · EMQX · Elasticsearch · Logstash · Filebeat · Kibana · FCM · GitHub Actions

### 3-1. 플링고 피드 (Backend, 2021.11 – 2021.12)

피드 모델 정의, CRUD 중심 API. 일반/관리자 앱 유스케이스 각각 분리 고려.

### 3-2. 메트릭 수집 시스템 (Backend, 2022.02)

- **맥락**: 그로스 해킹용 전 서비스 통계 수집 범용 시스템. **비즈니스 로직 가용성**에 영향을 주지 않도록 분리.
- **판단**: 트래픽 확장에도 병목 없는 구조.
- **실행**:
  - 로그는 **MQTT → EMQX Message Broker**로 전달.
  - **Filebeat**로 Elasticsearch 적재.
  - **Logstash 배치**로 정제·재저장.
  - **Kibana**로 검색·시각화.
- **변화**: 가용성 유지·결합도↓, 트래픽 확장 병목 없는 구조 확보.

### 3-3. 플링고 푸시 재구축 (Backend, 2022.03)

- **맥락**: 기존 푸시 — 대량 발송 시 서버 다운·메시지 누락, 데이터 메시지 전송 불가, 예약·그룹 발송 부재. 서비스 운영 중이고 인력 부족.
- **판단**: 운영 중단 위험을 피해 *근본 구조 변경 대신 전략적 기능 추가*로 우회.
- **실행**: 발송 대상 그룹화·예약 발송·데이터 메시지 전송 추가 (Express·MongoDB·Mongoose·FCM).

### 3-4. 인프라 환경 최적화 (Infrastructure 1인, 2021.10)

- B2C 신속 버그 수정·배포가 필수 → **컴팩트·저변수 GitOps**.
- 운영 유사 Dev 환경 추가 → 인수 테스트 신뢰도 향상.
- GitHub Actions 크론잡으로 매일 새벽 운영 데이터 import → Dev 환경 운영 유사도 유지.
- ECS, MongoDB Atlas. Dev MongoDB는 ECS 상 별도.
- 정적 자산(S3) + CloudFront 전송 최적화.

---

## 4. 주식회사 리플라이랩 — 개발 리드 (2021.04 – 2021.08)

### 4-1. 우주공간 MVP 백엔드 (TPM/Tech Lead, 2021.05)

**스택**: React Native · Firebase · AWS Lambda · JavaScript

- **맥락**: 2주 데드라인.
- **판단**: 초기 RN+Firebase. RN에서 해결 까다로운 Firebase 이슈로 막힘 → *백엔드를 분리해 RN의 환경 의존을 회피*하는 **AWS Lambda 서버리스**로 즉시 선회.
- **결정 기준**: "데드라인이 2주이므로 막힌 곳을 우회하는 비용 < 막혀서 잃는 시간 비용."
- **실행**: 핵심 로직을 Lambda 함수로 재구현, RN은 UI·통신만. 우주공간 랜딩 페이지(2021.06)는 Vanilla Web·S3 정적 배포. GitOps 배포 자동화.

---

## 학력·자격

- 숭실대학교 대학원 소프트웨어학과 (2015.03 – 2017.02 졸업) — 학위논문 *Word2Vec 위키피디아 텍스트 분석*
- 한국산업기술대학교 컴퓨터공학과 (2006.03 – 2014.02 졸업)
- TOPCIT 육군참모총장 특별상 485점 (2016.12) · 정보처리기사 · JLPT N1 · TOEIC 915 (만료)
- AWS Technical Essentials / Big Data on AWS / Deep Learning on AWS (2020.08–09)
