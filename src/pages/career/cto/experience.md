---
title: 김윤덕 경력기술서 — CTO
purpose: cto
doc_type: 경력기술서
sources:
  - wiki/positioning.md
  - wiki/skills/_purpose-mapping.md
  - wiki/entities/탄소중립연구원.md
  - wiki/entities/크로노스.md
  - wiki/entities/쓰리랩스.md
  - wiki/entities/리플라이랩.md
  - wiki/entities/키온비트.md
  - wiki/projects/LynC.md
  - wiki/projects/LGSP.md
  - wiki/projects/풀무간-제품발견.md
  - wiki/projects/탄중연-온프레미스-K8s.md
  - wiki/projects/탄중연-팀리딩.md
  - wiki/projects/탄중연-ProdOps.md
  - wiki/projects/탄중연-공통유틸리티.md
  - wiki/projects/크로노-V1-V2.md
  - wiki/projects/쓰리랩스-인프라최적화.md
  - wiki/projects/쓰리랩스-메트릭수집.md
  - wiki/projects/우주공간-MVP.md
  - wiki/projects/키온비트-OnPremCloud.md
  - wiki/decisions/PMF없는시장-도메인우선.md
  - wiki/decisions/코어변경-vs-Plugin아키텍처.md
  - wiki/decisions/AWS-OnPrem-전환.md
  - wiki/decisions/RN-Firebase-서버리스-피벗.md
  - wiki/decisions/결제권자-사용자-괴리-PO인수.md
last_updated: 2026-06-05
layout: ../../../layouts/CareerLayout.astro
---

# 김윤덕 경력기술서 — CTO

> 0→1 시스템 설계·인프라·조직·전략을 가로지르며 의사결정의 질을 증거로 전환해 온 엔지니어 겸 PO.

자원이 부족하고 방향이 자주 바뀌는 스타트업 환경에서, 제품·기술·팀 시스템을 동시에 설계·운영해 왔다. 본 문서는 각 경력 항목을 **맥락·제약 → 판단 → 실행 → 변화**의 4요소로 정리한다. 정량 성과가 작아도 솔직히 쓰되, 그 결정에 이른 사고를 더 비중 있게 다룬다.

## 핵심 역량 (CTO 관점)

- **0→1 시스템 설계**: 두 개의 SaaS(LynC·LGSP), On-Premise 네이티브 K8s 인프라, On-Premise Cloud 솔루션을 0→1로.
- **인프라·DevOps**: Kubernetes (Talos·iPXE) · Terraform/Terramate · Keycloak SSO · GitOps · ISO 27001·27017.
- **조직·표준·인력**: Product Engineer 육성, ProdOps(스크럼 테일러링·필수 QA·Ways of Working), Notion 단일 지식 관리.
- **제품 전략**: 전략 분석(PESTEL·3C·STP·VC), Contextual Inquiry, Data Synthesis, PMF 정렬 제품 정의·제품화 전략.

---

## 1. 주식회사 탄소중립연구원 — CTO / PO (2023.05 – 2025.12, 2년 8개월)

LCA(전과정평가, ISO 14040·14044) 도메인의 SaaS·DX 솔루션을 0→1로 만들고, 자원이 한정되고 방향성이 자주 바뀌는 환경에서 제품·기술·팀 시스템을 동시에 설계·운영했다. 합류 결정 기준은 *같이 일하는 사람의 태도* — 개발자 팀원·PO를 만나본 뒤 "전력 투사 시 같이 성과 낼 팀"이라는 확신이 들었다.

### 1-1. LynC — LCA 분석 SaaS, 설계에서 운영까지 (Tech Lead / TPM, 2023.06 – 2025.12)

**팀**: PO 1, TPM/PE 1, PE 3–4, 디자이너 1
**스택**: NestJS · TypeORM · PostgreSQL · GraphQL / Nuxt 3 · Vue 3 · Vite · Pinia / Nx Monorepo · Docker · AWS(S3·SES) · GitHub Actions / Jest · Vitest · Storybook

#### 단계 1: Prototype (4주, 2023.06)

- **맥락**: LCA 시장 검증·사전 판촉이 필요. 독일 홍보 일정에 맞춰 4주 내 구현. 형성된 시장도 참고 제품의 고객도 없어 PMF에 기댈 수 없었다.
- **판단**: 영속성·도메인 모델링 부담을 덜고 *프론트 중심*으로 책임 이동 → Next.js 올인원. 백엔드는 NestJS 골조만. 모델링 독립 단계 생략, 직관 디자인 + just-in-time 모순 개선.
- **실행**: LCA 도메인 학습(컨설턴트 질문·세션), 디자인→시나리오→컨벤션 합의, 코드 리뷰로 스타일 정렬. 100시간+ 크런치, 회사 숙식.
- **변화**: 4주 안에 사용 가능한 MVP 완성. 팀 전우애 + 본 제품 합의 기반.

#### 단계 2: 본 제품 MVP (3개월, 2024.03 – 2024.06)

- **맥락·판단**: 프로토타입의 가치 제안을 검증하면서도 *PMF를 찾았을 때 엔진으로 재사용될 수 있는* 도메인 코어가 필요. "지금 만든 제품이 이후 PMF를 찾았을 때 엔진으로 재사용 가능해야 한다"가 기준 → **DDD·레이어드 아키텍처**. 단계별 의도적 아키텍처 분기. 자세히: [PMF없는시장-도메인우선] 의사결정. 설계 일관성을 위해 *두 가지 원칙을 명문화* — **(1) LCA 표준 ISO 14044·14040 철저 준수, (2) Eric Evans의 DDD 이론적 내용 철저 준수**. 경험적 차용이 아닌 *원전 기준의 일관성 정렬*.
- **실행**: 사내 LCA 컨설턴트와 반복 인터뷰로 도메인 모델링. ISO 14040·14044 이론 준수, GtG(Gate-to-Gate) 분석, Cutoff·Impact Score 연결 시나리오를 풀스택으로. 단위 공정 그래프를 **DAG 자료구조**로 추가·삭제 구현, 재귀 함수로 각 단위 공정의 탄소배출량 계산(부모→자식 영향). 프론트는 Atomic Design으로 추상/구상 컴포넌트의 View·통신 책임 분리.
- **변화**: 이론적 정합성을 갖춘 도메인 코어 확보. 이후 고객사 커스텀이 누적돼도 핵심이 흔들리지 않는 기반.
- **회고**: "쿼리 한 번에 로우 3억 개" 사건 — 도메인 모델=DB 스키마 직결의 한계 노출. 미봉책은 aggregate root 프로퍼티 JSON 저장. 이 경험이 운영 단계의 *스키마-도메인 점진 분리* 결정으로 이어짐.

#### 단계 3: 운영·업데이트 (2024.06 – 2025.12)

- **맥락**: 출시 후 고객사 SaaS 계약 다수. 고객사마다 다른 커스텀 요구가 급증.
- **판단**: 요구를 코어에 직접 반영하면 단기 대응은 빠르지만 변경이 누적돼 결국 재구현 비용을 치른다. 대신 **"확장은 허용하되 변경은 구조적으로 차단"** 하는 [Plugin 아키텍처] 채택. 헥사고날 아키텍처로 확장 지점 SoC 명확화, 쿼리 성능을 위해 DB 스키마를 도메인 모델과 *독립적으로 점진 분리*. 자세히: [코어변경-vs-Plugin아키텍처] 의사결정.
- **실행**: 프론트는 DrawerPlugin Vue Component + DrawerPluginManager(`pluginInfo` 인터페이스로만 등록). 백엔드는 NestJS 모듈 트리에서 커스텀 로직을 코어 도메인과 *완전 격리*. 고객사 적용 예: '승인 결재 프로세스'·'담당자 요청 관리'를 코어 변경 없이 Drawer Plugin으로 풀스택 구현·배포.
- **변화**: 핵심 코드의 변경 오염을 구조적으로 차단. 운영·세일즈(CSM)가 VOC에 빠르고 안전하게 대응할 수 있는 시스템 기반.

### 1-2. LGSP — 온실가스 감축 목표관리 DX 솔루션 (Tech Lead & Full-stack / TPM, 2024.08 – 2025.12)

**스택**: NestJS · GraphQL(Apollo) · PostgreSQL · Prisma / Vue 3 · Pinia · Vite / Service Worker · IndexedDB · ExcelJS · Chart.js / Layered Architecture · JWT · CASL(RBAC) · PWA

- **맥락**: 고객사가 수동 Excel로 처리하던 온실가스 계산을 디지털 전환. 원시 데이터(전력·연료) → 다단계 계산(배출계수 곱·재구조화·부서별 분배) → 시각화. 전환 시 직관적 로직을 **100% 보존**해야 했다.
- **판단**: 로직을 새로 정의하기보다 기존 Excel 구조를 *그대로 시스템 도메인에 매핑*. MVP 단계라 과도한 아키텍처 대신 **배치 프로세스+함수 체이닝**으로 기민함·안정성 균형. 레이어드 아키텍처, 스키마-로직 분리, 쿼리 빌더로 SQL-like Query 활용 위해 Prisma 채택.
- **실행**: ETL 파이프라인을 SoC 기준 설계. **DataFrameTable** — Python Pandas DataFrame 개념 차용 (셀/행/열 참조, column/row reduce, element-wise 연산, sub-table 추출). **Xlsx Parser** — ExcelJS 기반, 셀·테이블의 *스타일까지 식별*하는 스캐닝. **Xlsx → DataFrameTable Transformer**. 운영 단계엔 **Service Worker + IndexedDB Cache-First Wrapper Client**로 *부족한 데이터만 식별 요청* — 누락 데이터의 '연/월 리스트'만 인코딩해 일괄 요청 (HTTP·Socket 모두 제공). 레거시 엑셀 Transformer 별도 구현·마이그레이션 완료.
- **변화**: 비정형 Excel 문서를 일관된 시스템 데이터로 자동 변환하는 기반. 운영 단계에서 중복 서버 API 호출을 크게 줄이고 대용량 차트의 렌더링 속도·UX 개선.

### 1-3. Infrastructure & DevOps — 온프레미스 네이티브 K8s (Tech Lead 1인, 2023.05 – 2025.12)

**스택**: Terraform · Terramate · Kubernetes · Talos OS · iPXE · Keycloak · WireGuard · GitHub Actions · AWS · Prometheus · Grafana

- **맥락**: 개발자가 비즈니스 로직에 몰입할 수 있고, 신뢰·신속한 배포와 비용 최적화가 가능한 환경이 필요. 타깃이 내부 LCA 컨설턴트로 이동하며 AWS 유지의 비용·오케스트레이션 비효율 증가. 콘솔/CLI 관리로는 인프라 조망·상태 추적 어려움.
- **판단**: 소규모 내부 서비스엔 *안정성보다 성능·비용 효율*이 중요 → 일반 PC급 bare-metal On-Premise. 네이티브 K8s 최적화 위해 **immutable Talos OS** 채택. 확장성·선언적 프로비저닝 위해 **iPXE 네트워크 부팅**. 콘솔/CLI 한계는 **IaC(Terraform·Terramate)**로 해소 — 목적별 *Stack*으로 인프라 SoC. IAM 독립을 위해 **Keycloak SSO 센터**. 자세히: [AWS-OnPrem-전환] 의사결정.
- **실행**: K8s + Talos OS로 네이티브 K8s를 IaC로 제어. iPXE 네트워크 부팅으로 커널 중앙 통제·빠른 확장. 가정용 공유기 제약은 DHCP 자체 구축·TFTP 포워딩, L2 스위치 대안으로 UEFI VLAN. AWS Console/CLI 인프라를 Terraform·Terramate Stack으로 마이그레이션. Keycloak으로 IAM, 인프라 게이트웨이에 인증·인가 **리버스 프록시**(JWKS 검증·RPT) 붙여 SSO 센터. Site VPN은 등록·관리 쉬운 **WireGuard**를 라우터에 구성. GitHub Actions로 GitOps, Repo별 액션 구성을 책임 단위로 구분.
- **변화**: **배포 시간 약 4시간 → 30분**. 신규 프로젝트 CI/CD 구성 시간 단축. 관측가능성 향상(Prometheus + Grafana). **2024 ISO 27001·27017 인증** 획득 → 고객사 신뢰 확보.

### 1-4. 풀무간 — '진짜 LCA 분석'을 돕는 제품 발견 (PO, 2025.06 – 2025.12)

- **맥락**: LynC는 단일 제품 LCA 분석에 특화됐지만 실무는 데이터 수집·DX·고객 소통·사업장 단위 관리까지 포함. **결제권자(LCA 무관심) vs. 사용자(제품 호평)** 의 가치 비대칭으로 계약 성사율 저조. 회사가 LCA SaaS라는 단순 명제만 갖고 비즈니스 의사결정이 표류.
- **판단**: 결제권자와 사용자가 다르고 *원하는 것도 다르다.* 그러면 제품 가치 명제 자체를 재정의해야 한다. 대표·이사와 담판해 **PO 역할 인수**, 합리성·전문성으로 경영진 설득. 자세히: [결제권자-사용자-괴리-PO인수] 의사결정.
- **실행**: 전면 진단, VOC 3pager 작성·교육. 워크플로우 전체를 문제 영역으로 재설정. **전략 분석(PESTEL·3C·5F·STP·Value Chain)** + **Contextual Inquiry** + **Data Synthesis** → "직접 분석 솔루션이 아니라 *신뢰할 수 있는 결과물을 빠르게 제공하는 컨설팅*"이 고객 가치라는 결론. 솔루션·시나리오·IA·제품화 전략(컨설팅 앞세운 세일즈, 저가 프라이싱). 제품·일반·기술 전략을 포트폴리오/단중장기/그래프 구조로 관리.
- **변화**: 단발성 MVP 반복에서 벗어나, 데이터를 인사이트로 전환해 다음 제품으로 잇는 *전략적 제품 활동* 정착.

### 1-5. 제품팀 개발 환경 혁신 · ProdOps (PO / Tech Lead, 2024.01–2024.03 혁신 · ~2025.12 ProdOps)

- **맥락**: 경영진 아이디어 즉시 MVP 구현 방식의 개인 역량 의존도 과다. 전략·기획 부재가 비용 증가·품질 저하·지속가능성 악화로 연결.
- **판단**: "방임과 자유는 다르다 — 조직은 구성원이 일에 집중할 환경을 제공해야 한다." 척도(표준), 명확한 전략·기획, 테일러링된 프로세스가 품질을 좌우.
- **실행**:
  - 지식 관리: Notion 단일 지식 + 트리거 기반 워크플로우 자동화 + Artifact 템플릿.
  - Ways of Working: 가독성·모듈성·SoC·코드 가이드·Git 전략·"설명할 수 있는 디자인".
  - 프로세스: 스크럼 테일러링 + 필수 QA + 프로토타입 중심 합의 + 스프린트 회고 기반 체크리스트.
- **변화**: 표준은 디테일하게 자주 조정하되 **맥락·근거를 동반**하고 코드 리뷰에서 다뤄, 팀원 부담은 낮추면서 일정한 품질의 결과물을 내는 체계.

### 1-6. 팀 리딩 — Product Engineer 육성 (Lead, 2023.05 – 2025.12)

- **맥락**: 고객사 계약이 늘며 운영 맥락 파편화. 프론트·백 같은 기능적 분담만으로는 다중 프로젝트 감당 불가.
- **판단·실행**: 한 사람이 기획부터 엔지니어링까지 하나의 프로젝트를 **all-in-one**으로 담당하게 함. PM 소양을 직접 정의·교육·멘토링. 각자가 PM으로서 내린 결정은 실행 전 공유해 컨센서스를 도출하는 리뷰 프로세스 → 제품 일관성. 병행 운영: 성장 관리(밸류업 스터디·기술 세미나·취약성 기반 신뢰 위 원인 분석형 피드백) · Inspiration 관리(선제적 1on1) · 프로세스 QA(자가검진 체크리스트·넛지) · 크로스팀 소통(리더십 회의·인터뷰·라포).
- **변화**: 파편화된 요구 속에서도 팀원 각자가 독립적으로 프로젝트를 끌고 가는 동시에, 중앙화된 전략으로 제품의 코어 정체성·일관성 유지.

### 1-7. 공통 유틸리티 (Tech Lead · PE 3, 2023.05 – 2025.12)

구현 중 반복되는 기능을 식별·공통화·패키지화. 제공: Date·Array·Error 확장, i18n 모듈, Cursor Pagination Manager, Infinity Scroll List 추상 컴포넌트, Chart 추상 컴포넌트. 팀의 반복 구현 비용을 줄이고 제품 간 품질 편차를 낮춤.

### 1-8. 결말

대표가 "반응 없는 시장에 지쳐 최소 밸류로 빠르게 엑싯"을 결심. 조직을 대표의 직관적 결정에 즉각 호응하는 형태로 개편 → 7명이던 제품팀이 한 명 남기고 해체. 본인은 *합리적 업무 환경을 만들어 왔는데 원점 회귀, 성공 비전 소멸, 동료 부재*로 판단해 마침표.

---

## 2. 주식회사 크로노스 — CTO (2022.05 – 2023.04, 1년)

**스택**: TypeScript · Vue · NestJS · PostgreSQL · TypeORM · CloudFront · Lambda@Edge · sharp

### 2-1. 크로노 V2 — 시세·거래 플랫폼 (Tech Lead, 1인 풀스택, 2023.02 – 2023.04)

- **맥락**: 고가 시계는 온라인에서 정확한 시세 파악이 어렵다는 고질적 문제. 회사는 이를 해결할 노하우를 보유. 1인 개발로 빠르게 시장 진입 필요.
- **판단**: 1인 효율 극대화 — 불필요 공정 생략, 레퍼런스를 빠르게 역기획 → 프로토타입 → 직접 테스트로 점진 개선.
- **실행**: 제품 컨셉·시안·시나리오, 제품 등록/관리·유저 관리 Admin. **이미지 응답 속도 문제**는 원본 사용 시 악영향 → **CloudFront + Lambda@Edge + sharp**로 썸네일 최적화. 요청 파라미터별 캐시 히트 시 즉시 제공, 미스 시 엣지에서 처리·전송 후 캐시 등록 구조.
- **변화**: 시세 정보와 즉시 거래를 제공하는 플랫폼을 1인 체제로 구현·운영.

### 2-2. 크로노 V1 — 조각 투자 플랫폼 (Product Engineer, 2022.06 – 2022.11)

소자본 진입 장벽이 있는 고가 시계 재테크의 소유권을 지분 분할 판매. 금융 서비스 신뢰성 확보를 위해 **복식부기 장부 개념**을 도메인에 도입. 레퍼런스 기반 디자인 시안, 복식부기 기반 도메인·시퀀스 다이어그램 설계, BM 검증용 프론트엔드 프로토타입 개발.

---

## 3. 쓰리랩스 주식회사 — Backend / Infrastructure Engineer (2021.10 – 2022.05, 8개월)

**제품**: 플링고 (영어 학습 앱). **스택**: Express · MongoDB · Mongoose · React Native · ECS · Elasticsearch · Terraform · GitHub Actions · EMQX

### 3-1. 인프라 환경 최적화 (Infrastructure, 2021.10)

- B2C라 신속한 버그 수정·배포 필수. 혼자 안정적으로 관리할 **컴팩트·저변수 구조**·GitOps 필요.
- 운영과 유사한 Development 환경 추가(인수 테스트 신뢰도↑). GitHub Actions 크론잡으로 매일 새벽 운영 데이터 import → Dev 환경 운영 유사도 유지. ECS 채택, DB는 MongoDB Atlas, Dev MongoDB는 ECS 상 별도. 정적 자산(S3) + CloudFront.

### 3-2. 플링고 피드 서비스 (Backend, 2021.11 – 2021.12)

회사·크리에이터가 짧은 영어 학습 콘텐츠 발행하는 피드 기능 추가. 피드 모델 정의, CRUD 중심 API. 일반/관리자 앱 유스케이스 각각 분리 고려.

### 3-3. 메트릭 수집 시스템 (Backend, 2022.02)

- 그로스 해킹용 전 서비스 통계 수집 범용 시스템. 비즈니스 로직 가용성에 영향을 주지 않도록 *수집 시스템 분리*, 트래픽 확장 병목 없도록.
- 로그는 MQTT → Message Broker로 전달. Filebeat로 Elasticsearch 적재. Logstash 배치로 정제·재저장. Kibana로 검색·시각화.
- 가용성 유지·결합도↓ + 트래픽 확장 병목 없는 구조 확보.

### 3-4. 플링고 푸시 재구축 (Backend, 2022.03)

기존 푸시가 대량 발송 시 서버 다운·메시지 누락. 운영 중단 위험을 피하기 위해 *근본 구조 변경 대신 전략적 기능 추가*로 우회. 발송 대상 그룹화·예약 발송·데이터 메시지 전송 추가(Express·MongoDB·Mongoose·FCM)로 신뢰성·운영 효율 향상.

---

## 4. 주식회사 리플라이랩(구 세컨프라이스) — 개발 리드 (2021.04 – 2021.08, 5개월)

### 4-1. 우주공간 MVP 긴급 인수 (TPM/Tech Lead, 2021.05)

- **맥락**: 외주가 품질·일정 미충족 → 사내 개발팀 인수. 남은 기간 **2주**, 외주사와 기술 스택 상이.
- **판단**: 초기에는 RN+Firebase로 시도(모바일 단일 스택의 속도). 그러나 RN에서 해결 까다로운 Firebase 이슈 발생 → 막힌 채로 시간 보내는 비용 > 우회 비용. **AWS Lambda 서버리스로 전략 선회**. 자세히: [RN-Firebase-서버리스-피벗] 의사결정.
- **실행**: 핵심 로직을 Lambda 함수로 재구현, RN은 UI·통신 담당. 우주공간 랜딩 페이지(2021.06)는 Vanilla Web·S3 정적 배포. GitOps 배포 자동화·개발 프로세스 정의.
- **변화**: 일정 내 MVP 완성. 메인 플로우 중심 개발로 적재된 버그 수정에 추가 시간 — 이후 *안전장치·코드 컨벤션 중시*의 계기.

---

## 5. (주)키온비트 — CTO (2019.09 – 2020.10, 1년 2개월)

### 5-1. Kubernetes 기반 On-Premise Cloud 구축 솔루션 (Tech Lead 1인, 2019.10 – 2020.06)

**스택**: Kubernetes · Rancher · Istio · Drone · Helm · Gitea · Harbor · CoreDNS · MetalLB · Prometheus · Grafana · Terraform · Ansible

- **맥락**: 퍼블릭 클라우드 대비 저렴한 구축 비용과 DevOps 최적화로 차별화하는 자체 솔루션. 제로베이스.
- **판단**: 타깃을 좁히고 **일반 PC급 장비+오픈소스**로 구축·관리 비용 절감.
- **실행**: 표준 K8s 클러스터(kubeadm). 네트워크 — MetalLB SW LB·Gloo Gateway 외부 접속·Ansible 멀티노드 제어. IaC — Terraform. 데이터 — Redis-HA·Stolon. Private CI/CD — Drone·Gitea·Harbor (클론→빌드→테스트→이미지 스캔→Helm→배포). 보안 고도화 — CoreDNS 내부 도메인·Istio service mesh(통신 제어·TLS)·Cert-manager. 솔루션 관리 — Web GUI 대시보드. 관측가능성 — Prometheus + Grafana.
- **변화**: 마일스톤 기반으로 On-Premise Cloud 구축 솔루션을 0→1로 완성.

---

## 단기 경력

- (주)한박스마일 (2019.07–2019.08, 계약직) — V-Commerce MVP 풀스택
- (주)투미유 (2018.07, 계약직) — DUB 앱 AI 기능 개발(Data Scientist)
- 주식회사 녹색지성 (2014.05–2014.06, 인턴)

## 학력·자격

- 숭실대학교 대학원 소프트웨어학과 (2015.03–2017.02 졸업) — 학위논문 *Word2Vec 위키피디아 텍스트 분석*
- 한국산업기술대학교 컴퓨터공학과 (2006.03–2014.02 졸업) — 졸업작품 *만보킹*
- TOPCIT 육군참모총장 특별상 485점 (2016.12) · 숭실대 총장상 (2015.12)
- u300 유망창업팀 300 선발·입상 (2016.05)
- 정보처리기사 (2012.11) · 일본어 JLPT N1 (2010.08) · TOEIC 915 (2013.11, 만료)
- AWS Technical Essentials / Big Data on AWS / Deep Learning on AWS (2020.08–09)
