<template>
  <div class="portfolio-wrapper">
    <!-- Top Global Header -->
    <header class="global-header">
      <div class="header-top">
        <div class="header-icons">
          <span class="icon-circle"></span>
          <span class="icon-circle"></span>
        </div>
      </div>

      <h1 class="main-logo-title">PORTFOLIO</h1>

      <!-- Signature Red Line -->
      <div class="accent-line"></div>

      <!-- Categories / Meta Info -->
      <div class="meta-filters">
        <!-- <span class="meta-label">PRODUCT OPS & LEADERSHIP</span>
        <div class="filter-pills">
          <span class="pill active">WoW Design</span>
          <span class="pill active">Process Engineering</span>
          <span class="pill active">Knowledge Mgmt</span>
        </div> -->
      </div>
    </header>

    <!-- Page Content Container -->
    <main class="portfolio-container">
      <!-- =========================================
          SECTION 01: WoW & COMMUNICATION
          ========================================= -->
      <section class="section-block">
        <h2 class="section-title">Communication & WoW</h2>

        <div class="layout-grid">
          <aside class="sidebar">
            <h3 class="section-index">01. 일하는 방식(WoW) 설계</h3>
            <p class="text-small font-medium mt-small">
              핵심 가치 및 커뮤니케이션 원칙
            </p>
          </aside>

          <div class="main-content space-y-xlarge">
            <div class="space-y-medium">
              <h3 class="sub-title">문화 및 핵심 가치</h3>
              <div class="clean-card">
                <div class="split-stack">
                  <div class="stack-item">
                    <span class="tag-pill mb-small">Value 01</span>
                    <h4 class="card-title">초영역 인재 지향</h4>
                    <p class="text-body">
                      환경적 제약(인력/비용/변화) 속에서 필연적인
                      제너럴리스트이되, 도메인 집약적 B2B 품질을 담보하는
                      스페셜리스트의 하이 스탠다드를 추구합니다.
                    </p>
                  </div>
                  <div class="stack-item border-top-light pt-medium">
                    <span class="tag-pill mb-small">Value 02</span>
                    <h4 class="card-title">의미 있는 일을 하자</h4>
                    <p class="text-body">
                      목적 집약적 행위에 집중하여 군더더기를 배제합니다. 이는
                      결과의 품질은 물론 작업자의 지속가능성을 높이는 핵심
                      장치입니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-medium border-top-thin pt-large">
              <h3 class="sub-title">커뮤니케이션 & 문서화</h3>
              <p class="text-body">
                정보의 왜곡을 줄이고 대화 밀도를 높이기 위해
                <strong>목적성 있는 대화 환경</strong>을 조성합니다.
              </p>

              <div class="p-medium border-light-bg space-y-medium">
                <ul
                  class="text-body space-y-small"
                  style="list-style-type: disc; margin-left: 1.25rem"
                >
                  <li>
                    <strong>주제 집중:</strong> 대화 맥락이 입안자의 주제를
                    벗어나지 않으며, 주제 변경 시 명시적 의사 표현과 중재자의
                    결정이 따름.
                  </li>
                  <li>
                    <strong>What 중심:</strong> 본론(What)부터 이야기하되,
                    청유형으로 존중 유지.
                  </li>
                  <li>
                    <strong>구조적 대화:</strong> What-Why-How-What If 형식을
                    준수하며 불필요한 의도 설명 배제.
                  </li>
                  <li>
                    <strong>문서 표준:</strong> 의도에 따라 3WR, 4MAT, PREP
                    형식을 준수하며 Technical Writing 가이드 적용.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =========================================
          SECTION 02: TOOLS & KNOWLEDGE MGMT
          ========================================= -->
      <section class="section-block border-top-thin pt-xlarge">
        <h2 class="section-title">Tools & Systems</h2>

        <div class="layout-grid">
          <aside class="sidebar">
            <h3 class="section-index">02. 협업 도구 및 지식 관리</h3>
            <p class="text-small font-medium mt-small">
              도구 단일화와 자동화 체계
            </p>
          </aside>

          <div class="main-content space-y-xlarge">
            <div class="space-y-medium">
              <h3 class="sub-title">도구 단일화 및 자동화</h3>
              <p class="text-body">
                Jira와 Notion으로 파편화되어 있던 도구를
                <strong>Notion 기반 SSoT(Single Source of Truth)</strong>로
                통합했습니다.
              </p>

              <!-- Image Placeholder -->
              <div class="image-placeholder mt-medium mb-medium">
                <div class="image-inner">
                  <span class="image-text"
                    >Collaboration Tool Template System</span
                  >
                  <img :src="prodOps1Image" alt="prod_ops1" />
                </div>
              </div>

              <div class="clean-card">
                <h4 class="card-title">프로세스 기반 템플릿 운영</h4>
                <p class="text-body">
                  Pager, Ticket, Task부터 Sprint Planning/Review/Retrospect까지
                  전 과정의 문서를 템플릿화하여 점진적으로 개선 및 관리합니다.
                </p>
              </div>
            </div>

            <div class="space-y-medium border-top-thin pt-large">
              <h3 class="sub-title">지식 관리 체계 (Knowledge Governance)</h3>

              <!-- Image Placeholder -->
              <div class="image-placeholder mt-medium mb-medium">
                <div class="image-inner">
                  <span class="image-text"
                    >Knowledge Management Architecture</span
                  >
                  <img :src="prodOps2Image" alt="prod_ops2" />
                </div>
              </div>

              <div class="clean-card">
                <p class="text-body mb-small">
                  워크스페이스를 업무 주관 부서별로 구조화하고, 제품팀 내
                  Technical Governance(Wow, 개발 표준, 컨벤션)를 정립했습니다.
                </p>
                <p class="highlight-text">
                  노하우 공유를 위한 <strong>'레퍼런스'</strong>와 문제 해결
                  여정을 담은 <strong>'삽질로그'</strong>를 운영하여 팀의 집단
                  지성을 강화했습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =========================================
          SECTION 03: PROCESS REDESIGN
          ========================================= -->
      <section class="section-block border-top-thin pt-xlarge">
        <h2 class="section-title">Process Redesign</h2>

        <div class="layout-grid">
          <aside class="sidebar">
            <h3 class="section-index">03. 제품 프로세스 분석 및 해결</h3>
            <p class="text-small font-medium mt-small">
              기획 부재 해결과 PO 전권 인수
            </p>
          </aside>

          <div class="main-content space-y-xlarge">
            <div class="space-y-medium">
              <h3 class="sub-title">원인 분석: 왜 품질이 부족했는가?</h3>
              <p class="text-body">
                리더십 회의와 실무 모니터링을 통해 '아이디어 → 곧장 개발'로
                이어지는 구조의 위험성을 식별했습니다.
              </p>

              <div class="cards-grid-vertical mt-medium">
                <div class="clean-card">
                  <span class="tag-pill mb-small">Issue 01</span>
                  <h4 class="card-title">제품 기획의 부재</h4>
                  <p class="text-body">
                    정합성 검증 없이 개발에 착수하여 도메인 집약적 프로젝트의
                    리스크를 키움.
                  </p>
                </div>
                <div class="clean-card">
                  <span class="tag-pill mb-small">Issue 02</span>
                  <h4 class="card-title">제품 전략의 부재</h4>
                  <p class="text-body">
                    환경 분석에 기반한 테마가 없어 전략적 경향성과 맥락 공유가
                    어려움.
                  </p>
                </div>
                <div class="clean-card">
                  <span class="tag-pill mb-small">Issue 03</span>
                  <h4 class="card-title">발견 활동의 부재</h4>
                  <p class="text-body">
                    VOC가 곧장 개발로 이어져 실무 역량 대비 결과 품질이 낮고
                    맥락이 단절됨.
                  </p>
                </div>
              </div>
            </div>

            <div class="space-y-medium border-top-thin pt-large">
              <h3 class="sub-title">해결: 프로세스 묘미 설계</h3>
              <p class="highlight-text">
                PO 전권을 인수받아
                <strong>전략-발견-정의-기획</strong> 프로세스를 공식화했습니다.
                최소 필요한 절차만 남겨 직관성을 유지하되, 성장을 위한 안배를
                포함했습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- =========================================
          SECTION 04: DISCOVERY & PLANNING
          ========================================= -->
      <section class="section-block border-top-thin pt-xlarge">
        <h2 class="section-title">Discovery & Planning</h2>

        <div class="layout-grid">
          <aside class="sidebar">
            <h3 class="section-index">04. 상세 프로세스 정의</h3>
            <p class="text-small font-medium mt-small">
              발견부터 기획까지의 파이프라인
            </p>
          </aside>

          <div class="main-content space-y-xlarge">
            <div class="space-y-medium">
              <h3 class="sub-title">제품 발견 프로세스</h3>
              <div class="clean-card">
                <h4 class="card-title">Contextual Research & PMF 정렬</h4>
                <p class="text-body mb-small">
                  데스크 리서치로 마켓 핏을, 사용자 리서치로 프로덕트 핏을
                  확인합니다. 고객 업무 환경 관찰과 모델링(Affinity Diagram,
                  HMW)을 통해 해결 과제를 추출합니다.
                </p>
                <p class="text-body">
                  최종적으로 가치 사슬을 설계하고 조직 대전략과의 개연성을
                  검증하여 PO의 개발 페이즈 입력물을 완성합니다.
                </p>
              </div>
            </div>

            <div class="space-y-medium border-top-thin pt-large">
              <h3 class="sub-title">제품 기획 프로세스</h3>
              <div class="clean-card">
                <h4 class="card-title">컨셉 정의 및 시나리오 설계</h4>
                <p class="text-body mb-small">
                  사용자 리서치를 토대로 메타포를 발굴하고, 가정 및 한계 사항을
                  꼼꼼히 기록합니다. 시나리오는 UX 관점에서 설계하며
                  스토리보드를 통해 실행 가능성을 테스트합니다.
                </p>
                <p class="text-body">
                  <strong>IA 및 데이터 모델링:</strong> 시나리오가 확정되면 정적
                  구조(IA)와 기술적 디자인(ERD, 도메인 모델링)으로 전개하여 개발
                  사양을 확정합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =========================================
          SECTION 05: DEV & OPS
          ========================================= -->
      <section class="section-block border-top-thin pt-xlarge">
        <h2 class="section-title">Dev & Ops</h2>

        <div class="layout-grid">
          <aside class="sidebar">
            <h3 class="section-index">05. 개발 및 운영 프로세스</h3>
            <p class="text-small font-medium mt-small">
              스크럼 운영과 VOC 대응 체계
            </p>
          </aside>

          <div class="main-content space-y-xlarge">
            <div class="space-y-medium">
              <h3 class="sub-title">제품 개발 (Scrum)</h3>
              <p class="text-body">
                백로그 우선순위는 비즈니스 스탠스를 반영하며, 스프린트 리뷰는
                인수 테스트 형식으로 수행합니다. 회고에서는 KPT를 통해 프로세스
                자체의 품질을 진단합니다.
              </p>
            </div>

            <div class="space-y-medium border-top-thin pt-large">
              <h3 class="sub-title">제품 운영 및 품질 관리</h3>
              <div class="p-medium border-light-bg space-y-medium">
                <div>
                  <h4 class="font-bold text-main">모니터링 & 티켓</h4>
                  <p class="text-body">
                    정성적 모니터링(UT, VOC)을 주축으로 티켓을 정의합니다. 본
                    제품 컨셉 위배 시 SoC를 고려하여 파일/모듈 단위 혹은 서버
                    분리를 결정합니다.
                  </p>
                </div>
                <div class="border-top-light pt-medium">
                  <h4 class="font-bold text-main">Multi-Layer QA</h4>
                  <ul
                    class="text-body space-y-small"
                    style="list-style-type: disc; margin-left: 1.25rem"
                  >
                    <li>
                      <strong>업무 QA:</strong> 표준 준수 자가 진단 체크리스트
                      활용.
                    </li>
                    <li>
                      <strong>제품 QA:</strong> Backend E2E(Bruno), Frontend
                      Storybook 활용. TDD 최적화 적용.
                    </li>
                    <li>
                      <strong>프로세스 QA:</strong> 스프린트 회고를 통해 경험
                      설계의 문제를 진단하고 수정.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="global-footer border-top-thin">
      <div class="footer-content">
        <p class="footer-logo">Portfolio</p>
        <div class="footer-info">
          <p class="text-gray-light">© 2026 All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
// Image imports using new URL for proper Vite handling
const prodOps1Image = new URL(
  "../../../../images/contents_image/prod_ops1.webp",
  import.meta.url,
).href;
const prodOps2Image = new URL(
  "../../../../images/contents_image/prod_ops2.webp",
  import.meta.url,
).href;
</script>

<style scoped>
/* ==========================================================================
   CSS Variables & Base Reset
   ========================================================================== */
:root {
  --color-bg-main: #ffffff;
  --color-text-main: #111111;
  --color-text-gray: #555555;
  --color-text-gray-light: #999999;
  --color-border: #e0e0e0;
  --color-border-light: #f0f0f0;
  --color-accent-red: #d32f2f;
  --color-bg-muted: #fafafa;

  --border-thin: 1px solid var(--color-border);
  --border-light: 1px solid var(--color-border-light);
}

.portfolio-wrapper {
  min-height: 100vh;
  background-color: var(--color-bg-main);
  color: var(--color-text-main);
  font-family:
    "Inter",
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.portfolio-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}
@media (min-width: 768px) {
  .portfolio-container {
    padding: 0 3rem;
  }
}
@media (min-width: 1024px) {
  .portfolio-container {
    padding: 0 4rem;
  }
}

/* ==========================================================================
   Global Header
   ========================================================================== */
.global-header {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  text-align: center;
}
@media (min-width: 768px) {
  .global-header {
    padding: 3rem 3rem 2rem;
  }
}

.header-top {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
}
.header-icons {
  display: flex;
  gap: 0.5rem;
}
.icon-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: var(--border-thin);
  display: inline-block;
}

.main-logo-title {
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 2rem;
}
@media (min-width: 768px) {
  .main-logo-title {
    font-size: 5rem;
  }
}

.accent-line {
  height: 2px;
  width: 100%;
  background-color: var(--color-accent-red);
  margin-bottom: 1.5rem;
  opacity: 0.8;
}

.meta-filters {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
}
@media (min-width: 768px) {
  .meta-filters {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.meta-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.filter-pills {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.pill {
  font-size: 0.75rem;
  padding: 0.4rem 1rem;
  border: var(--border-thin);
  border-radius: 999px;
  color: var(--color-text-gray);
}
.pill.active {
  background-color: var(--color-text-main);
  color: #ffffff;
  border-color: var(--color-text-main);
  font-weight: 600;
}

/* ==========================================================================
   Typography & Utilities
   ========================================================================== */
.text-lead {
  font-size: 1.125rem;
  line-height: 1.6;
  font-weight: 500;
  color: var(--color-text-main);
}
@media (min-width: 768px) {
  .text-lead {
    font-size: 1.375rem;
  }
}

.text-body {
  font-size: 0.9375rem;
  line-height: 1.7;
  color: var(--color-text-gray);
}
@media (min-width: 768px) {
  .text-body {
    font-size: 1rem;
  }
}

.text-small {
  font-size: 0.8125rem;
  line-height: 1.6;
}
.text-gray-light {
  color: var(--color-text-gray-light);
}
.font-medium {
  font-weight: 500;
}
.font-bold {
  font-weight: 600;
}

.space-y-medium > * + * {
  margin-top: 1.25rem;
}
.space-y-xlarge > * + * {
  margin-top: 3.5rem;
}
.mb-small {
  margin-bottom: 0.75rem;
}
.mb-medium {
  margin-bottom: 1.5rem;
}
.mt-small {
  margin-top: 0.5rem;
}
.pt-medium {
  padding-top: 1.5rem;
}
.pt-large {
  padding-top: 2rem;
}
.pt-xlarge {
  padding-top: 4rem;
}
.border-top-thin {
  border-top: var(--border-thin);
}

/* ==========================================================================
   Layout Components
   ========================================================================== */
.section-block {
  padding-bottom: 4rem;
}
.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 3rem;
}

.layout-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
}
@media (min-width: 1024px) {
  .layout-grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 4rem;
  }
  .sidebar {
    grid-column: span 3 / span 3;
  }
  .main-content {
    grid-column: span 9 / span 9;
  }
}

.section-index {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-main);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border-light);
}

.sub-title {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin-bottom: 1.25rem;
  color: var(--color-text-main);
}

.tag-pill {
  font-size: 0.75rem;
  padding: 0.3rem 0.8rem;
  border: var(--border-thin);
  border-radius: 999px;
  color: var(--color-text-main);
  font-weight: 500;
  display: inline-block;
  background-color: var(--color-bg-muted);
}

.highlight-text {
  font-style: italic;
  color: var(--color-text-main);
  border-left: 3px solid var(--color-accent-red);
  padding-left: 1rem;
  margin-top: 1rem;
  display: block;
}

/* ==========================================================================
   Specific Modules
   ========================================================================== */
.clean-card {
  background-color: var(--color-bg-main);
  border: var(--border-thin);
  border-radius: 8px;
  padding: 1.5rem;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.clean-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
}
.card-title {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: var(--color-text-main);
}

.image-placeholder {
  width: 100%;
  background-color: var(--color-bg-muted);
  border: var(--border-light);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
}
.image-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}
.image-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-gray);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.split-stack {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.cards-grid-vertical {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.p-medium {
  padding: 1.5rem;
}
.border-light-bg {
  background-color: var(--color-bg-muted);
  border-radius: 8px;
  border: 1px solid var(--color-border-light);
}

/* Footer */
.global-footer {
  max-width: 1280px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}
.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.footer-logo {
  font-size: 1.25rem;
  font-weight: 700;
}
.footer-info {
  font-size: 0.75rem;
  text-align: right;
}
</style>
