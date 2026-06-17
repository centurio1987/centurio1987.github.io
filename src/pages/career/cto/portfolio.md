---
title: 김윤덕 포트폴리오 — CTO
purpose: cto
doc_type: 포트폴리오
sources:
  - wiki/positioning.md
  - wiki/skills/_purpose-mapping.md
  - wiki/projects/탄중연-온프레미스-K8s.md
  - wiki/projects/LynC.md
  - wiki/projects/LGSP.md
  - wiki/projects/풀무간-제품발견.md
  - wiki/projects/탄중연-ProdOps.md
  - wiki/projects/탄중연-팀리딩.md
  - wiki/projects/키온비트-OnPremCloud.md
  - wiki/decisions/AWS-OnPrem-전환.md
  - wiki/decisions/PMF없는시장-도메인우선.md
  - wiki/decisions/코어변경-vs-Plugin아키텍처.md
  - wiki/decisions/결제권자-사용자-괴리-PO인수.md
last_updated: 2026-06-05
layout: ../../../layouts/CareerLayout.astro
---

# 포트폴리오 — CTO

> 전략을 직접 구현까지 책임지는 풀스택 엔지니어 겸 PO. 0→1 제품·인프라·팀을 함께 설계.

## 기술 스택 한눈에

- **Backend**: NestJS · TypeScript · PostgreSQL (TypeORM / Prisma) · GraphQL · Express · MongoDB
- **Frontend**: Vue 3 / Nuxt 3 · Next.js · React Native · Pinia · Vite · Atomic Design
- **Infra / DevOps**: Kubernetes (Talos OS · iPXE) · Terraform · Terramate · Keycloak · GitHub Actions GitOps · WireGuard · Prometheus / Grafana · AWS (ECS · Lambda · CloudFront · S3 · SES)
- **Data**: ExcelJS · IndexedDB · MQTT · EMQX · Elasticsearch · Logstash · Kibana · Filebeat
- **Methodology**: DDD · 레이어드 · 헥사고날 · Plugin 아키텍처 · 전략 분석(PESTEL·3C·STP·VC) · Contextual Inquiry

---

## 1. 탄중연 온프레미스 네이티브 Kubernetes (2023.05 – 2025.12)

> AWS의 비용·오케스트레이션 한계를 넘어, 일반 PC급 장비 위에 네이티브 K8s를 IaC로 선언적으로 제어하는 자체 인프라.

[시각 자료]
- 온프레미스 구성도 (노드/네트워크/SSO 경계)
- SSO Center · IaC · GitOps 단계 다이어그램
- 배포 시간 Before/After 비교 (4h → 30min)

### 핵심 결정

> "소규모 내부 서비스에는 *안정성보다 성능·비용 효율*이 중요하다."

- AWS 유지 / EKS / **On-Premise 네이티브 K8s + IaC** 중 마지막 채택.
- immutable **Talos OS** + **iPXE 네트워크 부팅**으로 네이티브 K8s 확장성·OS 가변성 동시 해결.
- 콘솔/CLI 관리의 조망·추적 한계는 **Terraform·Terramate** Stack으로 인프라 SoC 실현.
- IAM 독립을 위해 **Keycloak SSO 센터** + 게이트웨이 리버스 프록시(JWKS·RPT).

### 정량 임팩트

- **배포 시간 4시간 → 30분**
- **2024 ISO 27001·27017 인증** 획득
- 신규 프로젝트 CI/CD 구성 시간 단축
- 관측가능성 향상 (Prometheus + Grafana)

---

## 2. LynC — LCA 분석 SaaS, 단계별 아키텍처 의도적 분기 (2023.06 – 2025.12)

> PMF 없는 시장에서 *도메인 자체를 자산화*. 0→1을 책임진 LCA SaaS.

[시각 자료]
- 레이어드 아키텍처 다이어그램
- Plugin 등록 흐름도 (DrawerPlugin ↔ PluginManager)
- 모노레포 모듈 트리
- 단위 공정 그래프 DAG (React Flow)

### 단계별 의도적 아키텍처 분기

| 단계 | 기간 | 아키텍처 | 결정 기준 |
|------|------|----------|-----------|
| Prototype | 4주 (2023.06) | Next.js 올인원, NestJS 골조만 | 시장 검증·판촉이 목적 → *프론트 중심·just-in-time 모순 개선* |
| 본 제품 MVP | 3개월 (2024.03–2024.06) | NestJS · TypeORM · GraphQL · Nuxt 3 · DDD 레이어드 | *도메인 자산화* — "PMF를 찾았을 때 엔진으로 재사용 가능해야 한다" |
| 운영·업데이트 | 1.5년+ | 헥사고날 + **Plugin 아키텍처** (DrawerPlugin / PluginManager) | "확장은 허용·변경은 차단" — 코어 동결, 변경 영향 범위 *구획화* |

### 도메인·아키텍처 디테일

- ISO 14040·14044 준수 GtG 분석, Cutoff·Impact Score 연결
- 단위 공정 그래프를 **DAG**로 추가·삭제, 재귀 함수로 탄소배출량 계산 (부모↔자식 영향)
- 운영 단계: DB 스키마를 도메인 모델과 *독립적으로 점진 분리* (쿼리 성능)
- 고객사 적용 예: '승인 결재 프로세스'·'담당자 요청 관리'를 코어 변경 없이 Drawer Plugin으로

---

## 3. LGSP — 온실가스 감축 목표관리 DX 솔루션 (2024.08 – 2025.12)

> 수동 Excel 로직을 **100% 보존**하며 디지털 전환한 SaaS.

[시각 자료]
- ETL 파이프라인 도식
- DataFrameTable 개념도
- Cache-First 데이터 흐름 (클라이언트 ↔ IndexedDB ↔ 서버)

### 데이터 추상화 자체 구현

- **DataFrameTable** — Python Pandas 개념 차용. 셀/행/열 참조, column/row reduce, element-wise 연산, sub-table 추출.
- **Xlsx Parser** — ExcelJS 기반, 셀·테이블의 *스타일까지 식별*하는 스캐너.
- **Xlsx → DataFrameTable Transformer** — 비정형 Excel → 일관된 시스템 데이터.

### 운영 단계 성능 최적화

- **Service Worker + IndexedDB Cache-First Wrapper Client** — *부족한 데이터만 식별 요청*.
- 누락 데이터의 '연/월 리스트'만 인코딩해 일괄 요청 (HTTP·Socket 모두 제공).
- 일부 연산 책임을 클라이언트 → 백엔드로 이전, DB 쿼리 최적화.

---

## 4. 풀무간 — PO 인수와 컨설팅 전략 전환 (2025.06 – 2025.12)

> 결제권자와 사용자의 가치 비대칭 해소를 위해 *PO 역할 인수*. 솔루션이 아닌 컨설팅 중심으로 제품 전략 재정의.

[시각 자료]
- 전략 분석 파이프라인 (PESTEL → 3C/5F/SWOT → STP → Value Chain)
- As-Is / To-Be 워크플로우
- 솔루션 컨셉 (레이어·작업 공간)

### 의사결정 핵심

> "결제권자와 사용자가 다르고 *원하는 것도 다르다.* 그러면 제품 가치 명제 자체를 재정의해야 한다."

| 옵션 | 단기 영향 | 장기 영향 |
|------|----------|----------|
| 기능 추가로 계약율 개선 | 즉시 가능 | 결제권자 무관심 미해결 |
| 가격·세일즈 전술 변경 | 단기 계약율↑ | 제품 정의 흔들림 |
| **PO 역할 인수, 제품 제로부터 재정의** | 큰 정치적·시간 비용 | *제품·전략·세일즈 일관 정렬 가능* |

### 실행 흐름

전면 진단 → VOC 3pager → **전략 분석(PESTEL·3C·5F·STP·VC)** + **Contextual Inquiry** + **Data Synthesis** → "직접 분석 솔루션이 아니라 *신뢰할 수 있는 결과물을 빠르게 제공하는 컨설팅*"이 고객 가치 → 솔루션·시나리오·IA·제품화 전략(컨설팅 앞세운 세일즈, 저가 프라이싱).

---

## 5. ProdOps + Product Engineer 육성 — 팀의 환경 설계 (2023.05 – 2025.12)

> "방임과 자유는 다르다." 표준·전략·테일러링된 프로세스가 품질을 좌우.

[시각 자료]
- ProdOps 4축 (지식 / Ways of Working / 프로세스 / 인력)
- Product Engineer all-in-one 모형 + 컨센서스 리뷰 흐름

### ProdOps

- Notion 단일 지식 + 트리거 기반 워크플로우 자동화 + Artifact 템플릿
- Ways of Working: 가독성·모듈성·SoC·코드 가이드·Git 전략·"설명할 수 있는 디자인"
- 스크럼 테일러링·필수 QA·프로토타입 중심 합의·회고 기반 체크리스트

### Product Engineer 육성

- 한 사람이 기획부터 엔지니어링까지 *all-in-one* 담당
- 각자가 PM으로서 내린 결정은 실행 전 공유 → 컨센서스 리뷰 프로세스
- 성장 관리 + Inspiration 관리(선제적 1on1) + 프로세스 QA + 크로스팀 소통

---

## 6. 키온비트 On-Premise Cloud 솔루션 (2019.10 – 2020.06)

> 일반 PC급 장비+오픈소스로 0→1 구축. *제로베이스에서 Private CI/CD·service mesh·관측가능성·인프라 제어 Web GUI까지.*

[시각 자료]
- AWS/클러스터 아키텍처 다이어그램

### 핵심 구성

- 표준 K8s 클러스터 (kubeadm/kubelet/kubectl)
- 네트워크: MetalLB · Gloo Gateway · Ansible 멀티노드
- IaC: Terraform · 데이터: Redis-HA · Stolon
- Private CI/CD: Drone · Gitea · Harbor (스캔→Helm→배포)
- 보안: CoreDNS · Istio service mesh · Cert-manager
- 솔루션 관리 Web GUI 대시보드
- 관측: Prometheus + Grafana

— 본 포트폴리오는 wiki/projects/, wiki/decisions/, wiki/concepts/ 페이지에서 query·정렬해 작성됨. 모든 사실은 wiki SSOT를 출처로 추적 가능.
