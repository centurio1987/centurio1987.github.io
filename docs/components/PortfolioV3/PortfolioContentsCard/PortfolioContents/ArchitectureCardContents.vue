<template>
  <div class="portfolio-wrapper">
    <!-- Top Global Header matching the list page style -->
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
      <!-- <div class="meta-filters">
        <span class="meta-label">FULL-STACK DEVELOPER</span>
        <div class="filter-pills">
          <span class="pill active">Nuxt 3</span>
          <span class="pill active">NestJS 10</span>
          <span class="pill">TypeORM</span>
          <span class="pill">PostgreSQL</span>
        </div>
      </div> -->
    </header>

    <!-- Page Content Container -->
    <main class="portfolio-container">
      <!-- =========================================
          SECTION 7: STANDARDS & ARCHITECTURE
          ========================================= -->
      <section class="section-block border-top-thin pt-xlarge">
        <h2 class="section-title">Architecture & Standards</h2>

        <div class="layout-grid">
          <aside class="sidebar">
            <h3 class="section-index">01. 탄중연 아키텍쳐 및 표준 정의</h3>
            <p class="text-small font-medium mt-small">
              개발/디자인 가이드라인 확립
            </p>
          </aside>

          <div class="main-content space-y-xlarge">
            <!-- 표준 요약 (Cards) -->
            <div class="space-y-medium">
              <div class="clean-card">
                <h4 class="card-title">개발 & 애플리케이션 표준</h4>
                <ul
                  class="text-body space-y-small"
                  style="list-style-type: disc; margin-left: 1.25rem"
                >
                  <li>
                    <strong>우선순위:</strong> 1. 가독성, 2. 모듈성, 3. 효율성
                  </li>
                  <li>
                    <strong>아키텍처:</strong> 프로젝트 조건에 따라 Layered 또는
                    Hexagonal Architecture 채택.
                  </li>
                  <li>
                    대응하는 SoC 및 구체적인 파일, 코드, 모듈 작성 표준 정의를
                    통해 구조 최적화 수행.
                  </li>
                </ul>
              </div>

              <div class="clean-card">
                <h4 class="card-title">브랜치 전략 & 코드 컨벤션</h4>
                <ul
                  class="text-body space-y-small"
                  style="list-style-type: disc; margin-left: 1.25rem"
                >
                  <li>
                    <strong>일반 배포:</strong> prod / staging / dev 브랜치
                    운영.
                  </li>
                  <li>
                    <strong>파편화 운영:</strong> 고객에 따라 별도로
                    운영/업데이트되는 경우 해당 버전에 독립적인 브랜치 생성.
                  </li>
                  <li>
                    <strong>컨벤션:</strong> 파일, 변수, 클래스, 컴포넌트, 모듈
                    네이밍 가이드라인 구축.
                  </li>
                </ul>
              </div>

              <div class="clean-card">
                <h4 class="card-title">디자인 컴포넌트 & 가이드라인</h4>
                <ul
                  class="text-body space-y-small"
                  style="list-style-type: disc; margin-left: 1.25rem"
                >
                  <li>
                    Atomic System을 기반으로 세부적인 컴포넌트 표준과 작성 방법
                    정의.
                  </li>
                  <li>버전 히스토리를 명기하여 소스코드와 버전을 일치.</li>
                  <li>
                    서비스가 분화되는 시점에는 해당 버전을 다른 페이지로
                    복제하여 안전하게 분리 작업.
                  </li>
                </ul>
              </div>
            </div>

            <!-- SoC 상세 내용 -->
            <div class="border-top-thin pt-large">
              <h3 class="sub-title">SoC (관심사 분리) 정의 및 예시</h3>
              <p class="text-body mb-large">
                협업과 유지보수성을 높이기 위해 코드, 파일 레벨의 관심사
                분리(Separation of Concerns) 항목을 구체적으로 정의했습니다.
              </p>

              <div class="p-medium border-light-bg space-y-large">
                <div>
                  <h4 class="font-bold text-main mb-small">
                    Vue 컴포넌트 표준
                  </h4>
                  <ul
                    class="text-body space-y-small"
                    style="list-style-type: disc; margin-left: 1.25rem"
                  >
                    <li>
                      통신과 Store 사용은 View 혹은 Sub-View, 그리고 View 전용
                      Composable에서만 사용합니다.
                      <span class="text-gray-light"
                        >(책임 분리를 통해 데이터 플로우 파악을 용이하게
                        함)</span
                      >
                    </li>
                    <li>
                      View의 <code>&lt;script setup&gt;</code>이 복잡해지면 View
                      전용 Composable로 분리합니다.
                    </li>
                    <li>
                      Prop Drilling은 <code>provide/inject</code> 패턴으로
                      회피합니다.
                    </li>
                    <li>
                      컴포넌트는 Abstraction(추상화)과
                      Implementation(구상화)으로 분리합니다. 추상화 컴포넌트는
                      재사용과 범용성에, 구상화 컴포넌트는 구체성과 인터페이스
                      명료성에 초점이 맞춰져 있으므로 코드베이스 상에서 철저히
                      분리하여 관리합니다.
                    </li>
                  </ul>
                </div>

                <div class="border-top-light pt-medium">
                  <h4 class="font-bold text-main mb-small">공통 규약</h4>
                  <ul
                    class="text-body space-y-small"
                    style="list-style-type: disc; margin-left: 1.25rem"
                  >
                    <li>
                      API는 데이터 플로우 식별 책임이 있는 사람이 Interface로
                      작성하여 공유하며, 이 Interface는 프론트엔드와 백엔드의
                      합의 문서 역할을 합니다.
                    </li>
                    <li>
                      Class를 실현할 때는 <code>interface</code>를 사용하고, 그
                      외의 데이터 구조에는 <code>type</code>을 선언하여 용례를
                      명확히 구분합니다.
                    </li>
                  </ul>
                </div>

                <div class="border-top-light pt-medium">
                  <h4 class="font-bold text-main mb-small">
                    설계 표준 (Backend/General)
                  </h4>
                  <ul
                    class="text-body space-y-small"
                    style="list-style-type: disc; margin-left: 1.25rem"
                  >
                    <li>
                      Architecture에 도메인 레이어가 포함될 경우, CQRS(Command
                      and Query Responsibility Segregation) 패턴을 적극적으로
                      고려합니다.
                    </li>
                    <li>
                      비즈니스 로직에서 <strong>Aggregate</strong>가 식별되는
                      경우에 한해서만 DDD(Domain-Driven Design)를 포함합니다.
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
// 순수 프레젠테이션용 정적 컴포넌트로 유지합니다.
</script>

<style scoped>
/* ==========================================================================
   CSS Variables & Base Reset (Minimalist & Clean Theme)
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

/* 텍스트 드래그(Selection) 스타일 */
.portfolio-wrapper ::selection {
  background-color: rgba(0, 0, 0, 0.1);
  color: var(--color-text-main);
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
@media (min-width: 1024px) {
  .global-header {
    padding: 4rem 4rem 3rem;
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
@media (min-width: 1024px) {
  .main-logo-title {
    font-size: 6.5rem;
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
  transition: all 0.2s ease;
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
.font-medium {
  font-weight: 500;
}
.font-bold {
  font-weight: 600;
}
.text-main {
  color: var(--color-text-main);
}
strong {
  font-weight: 600;
  color: var(--color-text-main);
}

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

.space-y-small > * + * {
  margin-top: 0.75rem;
}
.space-y-medium > * + * {
  margin-top: 1.25rem;
}
.space-y-large > * + * {
  margin-top: 2rem;
}
.space-y-xlarge > * + * {
  margin-top: 3.5rem;
}

.mb-small {
  margin-bottom: 0.75rem;
}
.mb-large {
  margin-bottom: 2.5rem;
}
.mt-small {
  margin-top: 0.5rem;
}
.mt-large {
  margin-top: 2.5rem;
}

.pt-large {
  padding-top: 2rem;
}
.pt-xlarge {
  padding-top: 4rem;
}

.p-medium {
  padding: 1.5rem;
}

.border-top-thin {
  border-top: var(--border-thin);
}
.border-top-light {
  border-top: var(--border-light);
}
.border-light-bg {
  background-color: var(--color-bg-muted);
  border-radius: 8px;
  border: var(--border-light);
}

/* ==========================================================================
   Layout Components
   ========================================================================== */
.section-block {
  padding-bottom: 4rem;
}
@media (min-width: 1024px) {
  .section-block {
    padding-bottom: 6rem;
  }
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 3rem;
}
@media (min-width: 768px) {
  .section-title {
    font-size: 3.5rem;
  }
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

/* ==========================================================================
   Specific Modules
   ========================================================================== */
.section-index {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-main);
  padding-bottom: 0.5rem;
  border-bottom: var(--border-light);
}

.sub-title {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin-bottom: 1.25rem;
  color: var(--color-text-main);
}

.highlight-text {
  font-style: italic;
  color: var(--color-text-main);
  border-left: 3px solid var(--color-accent-red);
  padding-left: 1rem;
  margin-top: 1rem;
  display: block;
}

/* Image Placeholder styling */
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

/* Tech List & Cards Grid */
.tech-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-text-gray);
}
.tech-list li {
  padding: 0.25rem 0;
  border-bottom: 1px dashed var(--color-border-light);
}
.tech-list li:last-child {
  border-bottom: none;
}

.cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}
@media (min-width: 768px) {
  .cards-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2rem;
  }
}
@media (min-width: 1024px) {
  .cards-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.clean-card {
  background-color: var(--color-bg-main);
  border: var(--border-thin);
  border-radius: 8px;
  padding: 1.5rem;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-text-gray);
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
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: var(--color-text-main);
}

/* Footer */
.global-footer {
  max-width: 1280px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}
@media (min-width: 768px) {
  .global-footer {
    padding: 4rem 3rem;
  }
}
@media (min-width: 1024px) {
  .global-footer {
    padding: 4rem 4rem;
  }
}

.footer-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
}
@media (min-width: 640px) {
  .footer-content {
    flex-direction: row;
    align-items: center;
  }
}
.footer-logo {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.footer-info {
  font-size: 0.75rem;
  text-align: left;
}
@media (min-width: 640px) {
  .footer-info {
    text-align: right;
  }
}
</style>
