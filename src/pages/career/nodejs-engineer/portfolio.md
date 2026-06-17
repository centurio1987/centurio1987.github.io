---
title: 김윤덕 포트폴리오 — Node.js 엔지니어
purpose: nodejs-engineer
doc_type: 포트폴리오
sources:
  - wiki/positioning.md
  - wiki/skills/_purpose-mapping.md
  - wiki/projects/LynC.md
  - wiki/projects/LGSP.md
  - wiki/projects/쓰리랩스-메트릭수집.md
  - wiki/projects/우주공간-MVP.md
  - wiki/projects/크로노-V1-V2.md
  - wiki/decisions/PMF없는시장-도메인우선.md
  - wiki/decisions/코어변경-vs-Plugin아키텍처.md
  - wiki/decisions/RN-Firebase-서버리스-피벗.md
last_updated: 2026-06-05
layout: ../../../layouts/CareerLayout.astro
---

# 포트폴리오 — Node.js 엔지니어

> NestJS·TypeScript·TypeORM/Prisma·GraphQL·Express로 도메인 모델링·쿼리 최적화·메시징·서버리스를 풀스택 책임지는 백엔드 엔지니어.

## 기술 스택 한눈에

- **런타임 / 프레임워크**: NestJS · TypeScript · Express · Apollo GraphQL · AWS Lambda · API Gateway
- **데이터 액세스**: TypeORM · Prisma · Mongoose · PostgreSQL · MongoDB · Redis · IndexedDB
- **메시징·관측**: MQTT · EMQX · Elasticsearch · Logstash · Filebeat · Kibana · Prometheus / Grafana
- **아키텍처**: DDD · 레이어드 · 헥사고날 · Plugin (NestJS 모듈 트리 격리) · 스키마-도메인 점진 분리 · CASL · JWT
- **인프라 (보조)**: AWS · Docker · Kubernetes · Terraform · GitHub Actions GitOps

---

## 1. LynC — DDD 레이어드 → 헥사고날 + Plugin 격리 백엔드

> NestJS·TypeORM·PostgreSQL·GraphQL 스택으로 PMF 없는 시장의 도메인을 자산화하고, 운영 단계엔 NestJS 모듈 트리에서 커스텀 로직을 코어와 완전 격리.

[시각 자료]
- 4-layer 다이어그램 (Resolver / Service / Domain / Infrastructure)
- 헥사고날 + Plugin 모듈 격리 도식
- 단위 공정 그래프 DAG 구조 + 재귀 탄소배출량 계산 흐름
- 스키마-도메인 매핑 레이어

### MVP — DDD·레이어드

- 4-layer (Resolver / Service / Domain / Infrastructure). 도메인 레이어가 *타 레이어 최적화와 충돌 시 우선*.
- ISO 14040·14044 LCA 도메인을 사내 컨설턴트와 반복 인터뷰로 모델링.
- GtG 분석, Cutoff·Impact Score 연결 시나리오를 **GraphQL**로 expose.
- 단위 공정 그래프를 **DAG 자료구조**로 표현, 재귀 함수로 탄소배출량 계산.

### 운영 — 헥사고날 + Plugin

| 영역 | 구현 |
|------|------|
| **NestJS 모듈 트리** | 커스텀 로직을 코어 도메인과 *완전 격리* (Monorepo) |
| **Plugin 모듈** | '승인 결재 프로세스', '담당자 요청 관리'를 코어 변경 없이 풀스택 구현 |
| **스키마-도메인 점진 분리** | 영속성 모델과 도메인 모델 사이의 매핑 레이어. 쿼리 성능 확보 |

### 도메인 위기 — "쿼리 한 번에 로우 3억 개"

본 제품 MVP 단계에서 발견한 1:N 중첩 폭증. 도메인 모델=DB 스키마 직결의 한계. 미봉책은 aggregate root JSON 저장. 회고에서 명확한 컨셉·명분 없는 미봉책으로 인정, 운영 단계의 *스키마-도메인 점진 분리*로 근본 해결.

---

## 2. LGSP — NestJS·Prisma·GraphQL + ETL 자체 추상화

> 레이어드, 스키마-로직 분리, 쿼리 빌더로 SQL-like Query를 활용하기 위해 Prisma 채택. ETL은 함수 체이닝으로 MVP 일정 충족.

[시각 자료]
- ETL 파이프라인 도식 (Xlsx Parser → Transformer → DataFrameTable → ETL → 영속성)
- DataFrameTable 인터페이스 (Pandas-like)
- Cache-First Wrapper Client 흐름 (IndexedDB ↔ HTTP/Socket)

### 백엔드 디테일

| 영역 | 구현 |
|------|------|
| 아키텍처 | 레이어드, 스키마 설계를 로직과 분리 |
| 데이터 액세스 | **Prisma** (쿼리 빌더로 SQL-like Query) |
| 인증·인가 | JWT + CASL (RBAC) |
| API | **GraphQL (Apollo)** |
| ETL | 배치 프로세스 + 함수 체이닝 (MVP 기민·안정 균형) |

### 데이터 추상화

- **DataFrameTable** — Pandas-like 인터페이스. 셀/행/열 참조, column/row reduce, element-wise 연산, sub-table 추출.
- **Xlsx Parser** — ExcelJS 기반, 스타일까지 식별.
- **Xlsx → DataFrameTable Transformer** — 비정형 Excel → 일관된 시스템 데이터.

### 운영 단계 — Cache-First Wrapper Client

- **Service Worker + IndexedDB** Cache-First 계층. IndexedDB 우선 조회, 캐시 미스에만 서버 요청.
- 누락된 '연/월 리스트'만 인코딩해 일괄 요청.
- 통신 경로 **HTTP·Socket 모두** 제공.
- 일부 연산 책임을 클라이언트 → 백엔드로 이전, DB 쿼리 최적화.

---

## 3. 쓰리랩스 메트릭 수집 시스템 — MQTT → ES → Logstash → Kibana

> 비즈니스 로직 가용성에 영향 없는 분리 수집 시스템. 트래픽 확장 병목 없음.

[시각 자료]
- Message Broker 데이터 흐름 (MQTT → EMQX → Filebeat → Elasticsearch → Logstash → Kibana)
- 컴포넌트 결합도/격리 도식

### 아키텍처

```
서비스 로그
  └─▶ MQTT
        └─▶ EMQX Message Broker
              └─▶ Filebeat
                    └─▶ Elasticsearch (적재)
                          └─▶ Logstash (배치 정제·재저장)
                                └─▶ Kibana (검색·시각화)
```

### 핵심 결정

- 비즈니스 로직 가용성에 영향을 주지 않도록 **수집 시스템을 비즈니스 로직과 완전히 분리**.
- 컴포넌트별 *결합도↓·가용성↑*, 트래픽 확장에도 병목 없는 구조.

---

## 4. 우주공간 MVP — Lambda 서버리스 피벗

> RN+Firebase 막힘 → AWS Lambda로 즉시 선회해 2주 데드라인 충족.

[시각 자료]
- 피벗 전/후 아키텍처 비교 (RN+Firebase vs RN+Lambda)
- 클라이언트-서버 통신 계약

### 의사결정

> "데드라인이 2주이므로 막힌 곳을 우회하는 비용 < 막혀서 잃는 시간 비용."

| 선택지 | 일정 적합 | 리스크 |
|-------|-----------|--------|
| 외주 스택 유지 | 학습 비용 큼 | 일정 미스 확정 |
| RN + Firebase 풀스택 | 모바일 단일 스택 속도 | Firebase 이슈 막힘 |
| **RN + AWS Lambda 서버리스** | 백엔드 분리로 RN 환경 의존 회피 | 클라이언트-서버 통신 정의 부담 |

### 실행

- 핵심 로직을 **Lambda 함수**로 재구현.
- RN은 UI·통신만 담당.
- 우주공간 랜딩 페이지(2021.06)는 Vanilla Web · S3 정적 배포.
- GitOps 배포 자동화·개발 프로세스 정의.

---

## 5. 크로노 V2 — CloudFront + Lambda@Edge + sharp

> 원본 이미지 응답 속도 문제를 *엣지로 책임 이동*해 메인 서버 부담 감소.

[시각 자료]
- 썸네일 캐시 히트/미스 흐름

### 엣지 캐싱 구조

- 원본 이미지를 백엔드가 직접 서빙하면 응답 속도 악영향.
- 요청 파라미터별 캐시 히트 시 CloudFront에서 즉시 제공.
- 미스 시 Lambda@Edge에서 sharp로 처리·전송 후 캐시 등록.
- 백엔드(NestJS)는 메타데이터·인증·도메인 로직만 담당.

### V1 — 복식부기 도메인

소자본 진입 장벽이 있는 고가 시계 재테크의 소유권 지분 분할 판매. 금융 서비스 신뢰성 확보를 위해 **복식부기 장부 개념**을 도메인에 도입. 복식부기 기반 도메인·시퀀스 다이어그램 설계.

— 본 포트폴리오는 wiki/projects/, wiki/decisions/, wiki/concepts/ 페이지에서 query·정렬해 작성됨.
