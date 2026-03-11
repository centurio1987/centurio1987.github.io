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
      <div class="meta-filters"></div>
    </header>

    <!-- Page Content Container -->
    <main class="portfolio-container">
      <!-- =========================================
          SECTION 01: TECH STACK
          ========================================= -->
      <section class="section-block">
        <h2 class="section-title">Technical Stack</h2>

        <div class="layout-grid">
          <aside class="sidebar">
            <h3 class="section-index">01. 기술 스택 및 역량</h3>
            <p class="text-small font-medium mt-small">
              엔터프라이즈급 풀스택 아키텍처 구성
            </p>
          </aside>

          <div class="main-content space-y-medium">
            <!-- Tech Stack Summary -->
            <div class="clean-card">
              <div class="tech-grid-display">
                <div class="tech-category">
                  <h4 class="font-bold mb-small">Frontend</h4>
                  <p class="text-body">
                    Vue 3 (Composition API), Pinia, Vite, Apollo Client, Vitest,
                    Storybook
                  </p>
                </div>
                <div class="tech-category border-top-light pt-medium">
                  <h4 class="font-bold mb-small">Backend</h4>
                  <p class="text-body">
                    NestJS 10, GraphQL, Prisma ORM, PostgreSQL, Passport (JWT),
                    CASL
                  </p>
                </div>
                <div class="tech-category border-top-light pt-medium">
                  <h4 class="font-bold mb-small">Infra & DevOps</h4>
                  <p class="text-body">
                    AWS (S3, SES), Docker, Docker Compose, CI/CD, Yarn Berry
                    (PnP)
                  </p>
                </div>
              </div>
            </div>

            <!-- Detailed Tech List in Vertical Stack -->
            <div class="p-medium border-light-bg space-y-medium">
              <div class="detail-item">
                <h5 class="font-bold text-main">🔗 API & Data Layer</h5>
                <p class="text-small text-gray">
                  GraphQL CodeGen을 통한 타입 안전성 확보, DataLoader 기반 N+1
                  쿼리 최적화, Prisma 기반의 선언적 DB 관리
                </p>
              </div>
              <div class="detail-item border-top-light pt-small">
                <h5 class="font-bold text-main">📊 시각화 및 문서화</h5>
                <p class="text-small text-gray">
                  Chart.js (Sankey 포함), ExcelJS, jsPDF, html2canvas를 활용한
                  복잡한 데이터 분석 및 리포팅 도구 구축
                </p>
              </div>
              <div class="detail-item border-top-light pt-small">
                <h5 class="font-bold text-main">⚡ 성능 및 품질</h5>
                <p class="text-small text-gray">
                  Service Worker (PWA), Cache Manager 기반 캐싱,
                  Jest/Vitest/Cypress를 활용한 TDD 및 E2E 테스트 커버리지 확보
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =========================================
          SECTION 02: INITIAL DEVELOPMENT
          ========================================= -->
      <section class="section-block border-top-thin pt-xlarge">
        <h2 class="section-title">Initial Development</h2>

        <div class="layout-grid">
          <aside class="sidebar">
            <h3 class="section-index">02. 제품 최초 개발</h3>
            <p class="text-small font-medium mt-small">2024/08 ~ 2024/10</p>
          </aside>

          <div class="main-content space-y-xlarge">
            <div class="space-y-medium">
              <h3 class="sub-title">배경 및 목표</h3>
              <p class="text-body">
                고객사의 복잡한 원시 데이터(전력, 연료 등) 기반 다단계 계산
                절차를 디지털 전환(DX)하는 프로젝트입니다. 기존 엑셀의 복잡한
                로직을 서비스 내에서 그대로 보존하면서 대시보드 시각화까지
                연결하는 시스템을 구축했습니다.
              </p>
            </div>

            <div class="space-y-medium">
              <h3 class="sub-title">설계 핵심: ETL 파이프라인 및 SoC</h3>

              <!-- Image Placeholder for ETL -->
              <div class="image-placeholder">
                <div class="image-inner">
                  <span class="image-text">ETL Pipeline Architecture</span>
                  <img
                    src="/assets/images/contents_image/lgsp1.webp"
                    alt="lgsp1"
                  />
                </div>
              </div>

              <div class="clean-card">
                <h4 class="card-title">DataFrameTable 추상화</h4>
                <p class="text-body">
                  엑셀의 구조화되지 않은 데이터를 다루기 위해 Pandas의 개념을
                  차용한 <code>DataFrameTable</code>을 정의했습니다. 2차원
                  구조에서 셀 참조, 컬럼/로우 단위 연산(Reduce, Element-wise)
                  인터페이스를 제공하여 엑셀 로직의 정합성을 코드 레벨에서
                  유지했습니다.
                </p>
              </div>
            </div>

            <div class="space-y-medium">
              <h3 class="sub-title">구현 성과</h3>
              <div class="p-medium border-light-bg space-y-small">
                <ul
                  class="text-body space-y-small"
                  style="list-style-type: disc; margin-left: 1.25rem"
                >
                  <li>
                    <strong>Xlsx Parser & Transformer:</strong> Excel.js
                    기반으로 레이아웃과 스타일을 스캐닝하여 DataFrameTable로
                    변환하는 최적화된 파서 구현.
                  </li>
                  <li>
                    <strong>Layered Architecture:</strong> 백엔드 레이어드
                    아키텍처와 프론트엔드 상태 제어 표준을 정의하여 유지보수성
                    확보.
                  </li>
                  <li>
                    <strong>비즈니스 로직:</strong> 함수 체이닝 방식의 ETL
                    처리로 MVP 단계에서의 구현 속도와 유연성 동시 확보.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =========================================
          SECTION 03: OPS & UPDATES
          ========================================= -->
      <section class="section-block border-top-thin pt-xlarge">
        <h2 class="section-title">Ops & Updates</h2>

        <div class="layout-grid">
          <aside class="sidebar">
            <h3 class="section-index">03. 제품 운영 및 업데이트</h3>
            <p class="text-small font-medium mt-small">2024/10 ~ Present</p>
          </aside>

          <div class="main-content space-y-xlarge">
            <div class="space-y-medium">
              <h3 class="sub-title">차트 데이터 동기화 및 성능 최적화</h3>

              <!-- Image Placeholder for Sync Tech -->
              <div class="image-placeholder">
                <div class="image-inner">
                  <span class="image-text">Chart Data Sync Architecture</span>
                  <img
                    src="/assets/images/contents_image/lgsp2.webp"
                    alt="lgsp2"
                  />
                </div>
              </div>

              <div class="clean-card">
                <h4 class="card-title">Service Worker & Indexed DB 활용</h4>
                <p class="text-body mb-small">
                  대규모 차트 데이터 요청에 따른 서버 부하와 응답 속도 문제를
                  해결하기 위해 백그라운드 동기화 기술을 도입했습니다.
                </p>
                <p class="highlight-text">
                  요청 시 Indexed DB를 우선 조회하고, 누락된 데이터(년/월
                  리스트)만 인코딩하여 서버에 요청하는 최적화 알고리즘을
                  구현했습니다.
                </p>
              </div>
            </div>

            <div class="space-y-medium">
              <h3 class="sub-title">주요 업데이트 내역</h3>
              <div class="p-medium border-light-bg space-y-medium">
                <div class="update-item">
                  <h5 class="font-bold text-main">
                    Prefetching & Wrapper Client
                  </h5>
                  <p class="text-body">
                    Service Worker의 Prefetching 기능을 통해 사용자 체감 속도를
                    높이고, 투명하게 데이터를 스위칭하는 Wrapper Client를
                    구현했습니다.
                  </p>
                </div>
                <div class="update-item border-top-light pt-medium">
                  <h5 class="font-bold text-main">Legacy Data Transformer</h5>
                  <p class="text-body">
                    시스템 이전 시 필요한 레거시 엑셀 데이터를 최신 규격에 맞게
                    변환하는 전용 트랜스포머를 개발하여 데이터 연속성을
                    보장했습니다.
                  </p>
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
          <p class="text-gray-light">
            © 2026 Enterprise Architecture Portfolio
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
// Presentation-only static component
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
.text-gray {
  color: var(--color-text-gray);
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

.space-y-small > * + * {
  margin-top: 0.75rem;
}
.space-y-medium > * + * {
  margin-top: 1.5rem;
}
.space-y-xlarge > * + * {
  margin-top: 3.5rem;
}
.mb-small {
  margin-bottom: 0.75rem;
}
.mt-small {
  margin-top: 0.5rem;
}
.pt-small {
  padding-top: 0.75rem;
}
.pt-medium {
  padding-top: 1.5rem;
}
.pt-xlarge {
  padding-top: 4rem;
}
.border-top-thin {
  border-top: var(--border-thin);
}
.border-top-light {
  border-top: 1px solid var(--color-border-light);
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
  gap: 2rem;
}
@media (min-width: 1024px) {
  .layout-grid {
    grid-template-columns: 3fr 9fr;
    gap: 4rem;
  }
}

.section-index {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-main);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-light);
}

.sub-title {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin-bottom: 1rem;
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
  margin: 1rem 0;
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
  margin-bottom: 0.75rem;
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
  padding: 3rem 1.5rem;
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
