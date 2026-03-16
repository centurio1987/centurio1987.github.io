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
          <div class="main-content space-y-medium">
            <!-- Tech Stack Summary -->
            <div class="clean-card">
              <div class="tech-grid-display">
                <div class="tech-category">
                  <h4 class="font-bold mb-small">Frontend</h4>
                  <p class="text-body">
                    Next.js, React, Apollo Client, Styled Components / Tailwind
                    CSS
                  </p>
                </div>
                <div class="tech-category border-top-light pt-medium">
                  <h4 class="font-bold mb-small">Backend</h4>
                  <p class="text-body">
                    Nest.js, GraphQL, TypeORM, PostgreSQL, Passport (Auth)
                  </p>
                </div>
                <div class="tech-category border-top-light pt-medium">
                  <h4 class="font-bold mb-small">Architecture</h4>
                  <p class="text-body">
                    Domain-Driven Design (DDD), Layered Architecture, Monorepo
                    Support
                  </p>
                </div>
              </div>
            </div>

            <!-- Detailed Tech List -->
            <div class="p-medium border-light-bg space-y-medium">
              <div class="detail-item">
                <h5 class="font-bold text-main">🔗 API & Data Layer</h5>
                <p class="text-small text-gray">
                  GraphQL을 통한 선언적 데이터 페칭과 TypeORM을 활용한 안정적인
                  RDBMS 데이터 모델링 및 마이그레이션 관리
                </p>
              </div>
              <div class="detail-item border-top-light pt-small">
                <h5 class="font-bold text-main">🌍 Global Strategy</h5>
                <p class="text-small text-gray">
                  Custom i18n Hook 구현을 통한 다국어 확장성 확보 및 글로벌 시장
                  검증을 위한 유연한 로컬라이징 구조 설계
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =========================================
          SECTION 02: LCA ANALYSIS SOLUTION
          ========================================= -->
      <section class="section-block border-top-thin pt-xlarge">
        <h2 class="section-title">LCA Analysis Solution</h2>

        <div class="layout-grid">
          <div class="main-content space-y-xlarge">
            <div class="space-y-medium">
              <h3 class="sub-title">배경 및 콘셉트</h3>
              <p class="text-body">
                해외 판촉 및 시장 검증을 위한 LCA(Life Cycle Assessment) 분석
                서비스의 MVP입니다. 제품 하나에 대해 인터랙티브하게 공정을
                정의하고 연결해 나가는 방식을 기본 콘셉트로 합니다.
              </p>
              <p class="highlight-text">
                LCA 컨설턴트에 대한 강도 높은 인터뷰를 통해 도메인 형상을
                파악하고, 이를 실현 가능한 데이터 모델로 정밀하게
                모델링했습니다.
              </p>
            </div>

            <div class="space-y-medium">
              <h3 class="sub-title">주요 시각화 및 인터페이스</h3>

              <!-- Image Placeholders -->
              <div class="image-placeholder-group">
                <div class="image-placeholder">
                  <div class="image-inner">
                    <span class="image-text">Process Definition Interface</span>
                    <img :src="lyncMvpImage" alt="lync_mvp1" />
                  </div>
                </div>
                <div class="image-placeholder mt-medium">
                  <div class="image-inner">
                    <span class="image-text">Interactive Process Mapping</span>
                    <img :src="lyncMvpImage" alt="lync_mvp1" />
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-medium">
              <h3 class="sub-title">핵심 구현 성과</h3>
              <div class="vertical-stack">
                <div class="clean-card">
                  <h4 class="card-title">공정 관리 프론트엔드 로직</h4>
                  <p class="text-body">
                    공정 관리 페이지와 같이 카드 아이템 위주의 인터랙티브
                    페이지를 구현했습니다. 복잡한 공정 연결 상태를 사용자가
                    직관적으로 관리할 수 있는 UI/UX를 구축했습니다.
                  </p>
                </div>

                <div class="clean-card">
                  <h4 class="card-title">도메인 모델 및 백엔드 로직</h4>
                  <p class="text-body">
                    복잡한 LCA 도메인 지식을 백엔드 시스템에 투영했습니다.
                    컨설턴트의 업무 프로세스를 기반으로 한 데이터 스키마 설계와
                    전반적인 비즈니스 로직을 구축했습니다.
                  </p>
                </div>

                <div class="clean-card">
                  <h4 class="card-title">Custom i18n Hook 설계</h4>
                  <p class="text-body mb-small">
                    글로벌 서비스를 고려하여 정해진 위치에 locale별 사전을
                    등록하고, Hook을 통해 키값에 대응하는 언어 데이터를 반환하는
                    커스텀 로직을 구현했습니다.
                  </p>
                  <div class="highlight-text">
                    유연한 로컬라이징 구조를 통해 신규 국가 진출 시 코드 변경
                    최소화를 실현했습니다.
                  </div>
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
          <p class="text-gray-light">© 2026 Life Cycle Assessment Solutions</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
// Image imports using new URL for proper Vite handling
const lyncMvpImage = new URL(
  "../../../../images/contents_image/lync_mvp1.webp",
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
  padding: 1rem 1.5rem;
  text-align: center;
}
@media (min-width: 768px) {
  .global-header {
    padding: 1.25rem 3rem 1rem;
  }
}

.header-top {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.75rem;
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
.vertical-stack > * + * {
  margin-top: 1.5rem;
}
.mb-small {
  margin-bottom: 0.75rem;
}
.mt-small {
  margin-top: 0.5rem;
}
.mt-medium {
  margin-top: 1.5rem;
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
