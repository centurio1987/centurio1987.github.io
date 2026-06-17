---
title: 김윤덕 이력서 — CTO
purpose: cto
doc_type: 이력서
sources:
  - wiki/positioning.md
  - wiki/skills/_purpose-mapping.md
  - wiki/skills/아키텍처-풀스택.md
  - wiki/skills/인프라-DevOps.md
  - wiki/skills/리더십-프로세스.md
  - wiki/entities/탄소중립연구원.md
  - wiki/entities/personal-info.md
  - wiki/projects/LynC.md
  - wiki/projects/LGSP.md
  - wiki/projects/탄중연-온프레미스-K8s.md
  - wiki/projects/탄중연-팀리딩.md
  - wiki/projects/탄중연-ProdOps.md
  - wiki/projects/풀무간-제품발견.md
  - wiki/projects/키온비트-OnPremCloud.md
last_updated: 2026-06-05
layout: ../../layouts/CareerLayout.astro
---

# 김윤덕 — CTO 이력서

> **전략을 직접 구현까지 책임지는 풀스택 엔지니어 겸 PO.**
> 자원이 한정되고 방향이 자주 바뀌는 스타트업 환경에서 0→1 제품·인프라·팀 시스템을 함께 설계해 온 사람.

- centurio87@naver.com · +82 10-2641-1626
- [블로그](https://centurio1987.github.io) · [GitHub](https://github.com/centurio1987) · [LinkedIn](https://www.linkedin.com/in/yoondeok-kim-319bb8145)
- 경력 6년 3개월 (2025.12 기준)

## Summary

0→1 SaaS 두 개(LynC·LGSP), 0→1 온프레미스 네이티브 K8s 인프라, 0→1 On-Premise Cloud 솔루션을 설계·구현하고, 제품팀의 표준·프로세스·인력 육성을 동시에 책임진 CTO. *기술적 정합성을 갖춘 전략·기획*으로 의사결정의 근거를 만들고, 도메인 모델링부터 인프라까지 풀스택으로 책임진다.

## 핵심 정량 임팩트

- **배포 시간 4시간 → 30분** (탄중연 온프레미스 네이티브 K8s, 2023–2025)
- **2024 ISO 27001·27017 인증 획득** (탄중연 인프라)
- LCA SaaS **LynC**를 4주 프로토타입 → 3개월 MVP → 1.5년+ 운영까지 *단계별 의도적 아키텍처 분기*로 성공
- LGSP를 **레거시 Excel 로직 100% 보존**하며 DX 전환 (Service Worker + IndexedDB Cache-First)

## 경력 시퀀스

| 기간 | 회사 | 직함 | 핵심 |
|------|------|------|------|
| 2023.05 – 2025.12 | (주)탄소중립연구원 | CTO / PO | LCA SaaS·DX·온프레미스 인프라·제품팀 시스템 동시 설계 |
| 2022.05 – 2023.04 | (주)크로노스 | CTO | 1인 풀스택, 고가 시계 시세·거래(V2) / 조각 투자(V1) |
| 2021.10 – 2022.05 | 쓰리랩스(주) | Backend / Infra | 플링고 백엔드·메트릭 수집·B2C 인프라 최적화 |
| 2021.04 – 2021.08 | (주)리플라이랩 | 개발 리드 | 우주공간 MVP 긴급 인수, 서버리스 피벗 |
| 2019.09 – 2020.10 | (주)키온비트 | CTO | 일반 PC급 장비+오픈소스로 On-Premise Cloud 0→1 |

## 대표 의사결정 (CTO 시각)

- **[탄중연 AWS → 온프레미스 네이티브 K8s 전환]** — 소규모 내부 서비스엔 *안정성보다 성능·비용 효율*이 더 중요하다는 기준으로 일반 PC급 bare-metal + Talos OS + iPXE 네이티브 K8s + Terraform/Terramate Stack으로 전환. 배포 시간 4h → 30min, ISO 27001·27017 인증.
- **[LynC 단계별 아키텍처 의도적 분기]** — PMF 없는 시장에서 *프로토타입(프론트 올인원) vs. 본 제품(DDD·레이어드)*을 의도적으로 다르게 설계. "지금 만든 제품이 PMF를 찾았을 때 *엔진으로 재사용*돼야 한다"가 기준.
- **[LynC 코어 변경 → Plugin 아키텍처]** — 변경 누적의 비선형 비용을 피해 *확장은 허용·변경은 차단*하는 DrawerPlugin + PluginManager + 헥사고날 아키텍처 채택. 코어 동결, 변경의 영향 범위를 *구획화*.
- **[풀무간 PO 인수]** — 결제권자(LCA 무관심)와 사용자(제품 호평)의 가치 비대칭을 해소하기 위해 PO 역할을 인수, 컨설팅 중심 제품 전략으로 재정의.

## 핵심 역량

### 인프라·DevOps
Kubernetes (Talos · iPXE 네이티브) · Terraform · Terramate · Keycloak SSO / IAM · GitOps (GitHub Actions) · Prometheus · Grafana · AWS (ECS · Lambda · CloudFront · S3 · SES) · WireGuard · ISO 27001·27017

### 아키텍처·풀스택
DDD · 레이어드 · 헥사고날 · Plugin 아키텍처 · NestJS · TypeScript · Vue 3 / Nuxt 3 · Next.js · PostgreSQL (TypeORM / Prisma) · GraphQL · Monorepo (Nx)

### 제품·전략 (CTO·PO 겸직 경험)
전략 분석 (PESTEL · 3C · 5Forces · STP · Value Chain) · Contextual Inquiry · Data Synthesis · PMF 정렬 제품 정의 · 제품화 전략 · 이해관계자 컨센서스 도출

### 리더십·프로세스
Product Engineer 육성 (all-in-one) · 스크럼 테일러링 · 필수 QA · Ways of Working · Notion 단일 지식 관리 · 원인 분석형 피드백 · 선제적 1on1

## 학력·자격

- 숭실대학교 대학원 소프트웨어학과 (2015.03 – 2017.02 졸업) — 학위논문: Word2Vec 기반 위키피디아 텍스트 분석 시스템
- 한국산업기술대학교 컴퓨터공학과 (2006.03 – 2014.02 졸업) — 졸업작품 만보킹
- TOPCIT 육군참모총장 특별상 (485점, 2016.12)
- u300 유망창업팀 300 선발·입상 (2016.05)
- 정보처리기사 · 일본어 JLPT N1 · TOEIC 915 (만료)
- AWS Technical Essentials / Big Data on AWS / Deep Learning on AWS (2020.08–09)
