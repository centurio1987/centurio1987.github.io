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
          <div class="main-content">
            <div class="tech-stack-grid">
              <!-- Left Column -->
              <div class="tech-stack-col">
                <div class="tech-stack-card">
                  <h4 class="tech-stack-heading">⚡ 프론트엔드</h4>
                  <ul class="tech-stack-list">
                    <li><strong>Vue 3</strong> (3.3.4) - Composition API</li>
                    <li><strong>Vue Router</strong> (4.2.4) - 라우팅</li>
                    <li><strong>Pinia</strong> (2.1.6) - 상태 관리</li>
                    <li><strong>Vite</strong> (4.4.9) - 빌드 도구</li>
                    <li><strong>vite-plugin-pwa</strong> - PWA 지원</li>
                  </ul>
                </div>

                <div class="tech-stack-card">
                  <h4 class="tech-stack-heading">🔒 백엔드</h4>
                  <ul class="tech-stack-list">
                    <li><strong>NestJS 10</strong> - 서버 프레임워크</li>
                    <li>
                      <strong>GraphQL</strong> - Apollo, CodeGen, Subscriptions
                    </li>
                    <li><strong>Prisma</strong> (v5.4.1) - ORM</li>
                    <li><strong>PostgreSQL</strong> - 데이터베이스</li>
                    <li><strong>Passport &amp; JWT</strong> - 인증</li>
                    <li><strong>CASL</strong> (v6.5.0) - RBAC 권한 제어</li>
                  </ul>
                </div>

                <div class="tech-stack-card">
                  <h4 class="tech-stack-heading">🧹 코드 품질</h4>
                  <ul class="tech-stack-list">
                    <li><strong>TypeScript</strong> (5.2.2) - 정적 타입</li>
                    <li>
                      <strong>ESLint &amp; Prettier</strong> - 린팅/포매팅
                    </li>
                    <li><strong>Husky &amp; lint-staged</strong> - Git 훅</li>
                    <li>
                      <strong>Storybook</strong> (7.4.2) - 컴포넌트 카탈로그
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Right Column -->
              <div class="tech-stack-col">
                <div class="tech-stack-card">
                  <h4 class="tech-stack-heading">🧪 테스트 &amp; 품질</h4>
                  <ul class="tech-stack-list">
                    <li><strong>Jest</strong> - 단위/통합 테스트</li>
                    <li>
                      <strong>Vitest</strong> (1.6.0) - Vue 컴포넌트 테스트
                    </li>
                    <li><strong>Supertest</strong> - 백엔드 API E2E</li>
                    <li><strong>Cypress</strong> (13.2.0) - E2E 테스트</li>
                  </ul>
                </div>

                <div class="tech-stack-card">
                  <h4 class="tech-stack-heading">🏗 아키텍처 &amp; 도구</h4>
                  <ul class="tech-stack-list">
                    <li>
                      <strong>Yarn Berry</strong> (v3.6.3) - 패키지 매니저
                    </li>
                    <li>
                      <strong>Docker &amp; Compose</strong> - 개발/배포 환경
                    </li>
                    <li><strong>Cache Manager</strong> - 캐싱 전략</li>
                    <li><strong>Service Worker</strong> - PWA, Prefetching</li>
                  </ul>
                </div>

                <div class="tech-stack-card">
                  <h4 class="tech-stack-heading">
                    📊 데이터 &amp; ☁️ 클라우드
                  </h4>
                  <ul class="tech-stack-list">
                    <li><strong>ExcelJS</strong> / jsPDF - 문서 생성/처리</li>
                    <li>
                      <strong>Chart.js</strong> - 차트/그래프 (Sankey 포함)
                    </li>
                    <li><strong>DataLoader</strong> - N+1 쿼리 최적화</li>
                    <li><strong>AWS SDK</strong> - S3, SES</li>
                    <li><strong>html2canvas</strong> - HTML→캔버스 변환</li>
                  </ul>
                </div>
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
          <div class="main-content space-y-xlarge">
            <div class="space-y-medium">
              <h3 class="sub-title">배경</h3>
              <p class="text-body">
                고객이 복잡한 원시 데이터(전력 사용량, 연료 소비량 등)를
                기반으로 다단계 계산(배출계수 곱, 재구조화, 부서별 분배)을 거쳐
                최종 대시보드용 시각화 데이터를 생성하는 절차를 엑셀로 구현하고
                있었고, 이를 디지털 전환하고 싶어 하셨습니다. 기존 엑셀 로직을
                서비스에서도 그대로 보존해야 하는 조건도 있었습니다.
              </p>
            </div>

            <div class="space-y-medium">
              <h3 class="sub-title">설계: ETL 파이프라인</h3>

              <div class="image-placeholder">
                <div class="image-inner">
                  <span class="image-text">ETL Pipeline Architecture</span>
                  <img :src="lgsp1Image" alt="lgsp1" />
                </div>
              </div>

              <p class="text-body">
                이 프로젝트의 핵심은 엑셀 로직을 보존하면서도 효과적으로
                구현하는 것이었습니다. 엑셀 로직은 직관에 의해 구현되고 있어
                구조화가 어려웠기 때문에, SoC를 통해 엑셀의 어떤 부분이 어떤
                영역에 매칭되는지 확실히 파악할 수 있도록 했습니다.
              </p>
            </div>

            <div class="space-y-medium">
              <h3 class="sub-title">설계: DataFrameTable</h3>
              <p class="text-body">
                엑셀 내에는 구조나 목적이 다르지만 테이블 형태로 관리되고
                있었습니다. 데이터 추출과 변환 과정에서 테이블을 최대한
                추상화하여 DataFrameTable이라는 개념을 정의했습니다. Pandas의
                DataFrame 개념을 일부 차용했습니다. 2차원 구조에서 셀을 참조할
                수 있고, 컬럼과 로우 단위로 계산할 수 있습니다.
              </p>
            </div>

            <div class="space-y-medium">
              <h3 class="sub-title">설계: Architecture &amp; Standard</h3>
              <p class="text-body">
                아키텍처와 기술 스택을 정의했습니다. 공통적으로 코드 컨벤션과
                코드, 모듈, 파일 아키텍처를 정의했습니다. 백엔드에서는 레이어드
                아키텍처와 세부적인 개발 표준을, 프론트엔드에서는 상태 제어를
                중심으로 한 개발 표준을 정의했습니다.
              </p>
            </div>

            <div class="space-y-medium">
              <h3 class="sub-title">구현</h3>
              <div class="p-medium border-light-bg space-y-medium">
                <div class="update-item">
                  <h5 class="font-bold text-main">ETL 파이프라인 구현</h5>
                  <p class="text-body">
                    배치 프로세스로 규정하고 구현했습니다. 개념적으로는 각
                    파이프라인을 구분하여 구현했습니다. MVP에서 시작하는 만큼,
                    별도의 아키텍처나 리소스는 고려하지 않았습니다. 실행 방식도
                    함수 체이닝을 통해 구현했습니다.
                  </p>
                </div>
                <div class="update-item border-top-light pt-medium">
                  <h5 class="font-bold text-main">DataFrameTable 구현</h5>
                  <p class="text-body">
                    cell, row, column 조회, column, row 단위 reduce,
                    element-wise 연산, sub-table 추출 등의 인터페이스를 제공하는
                    DataFrameTable을 구현했습니다.
                  </p>
                </div>
                <div class="update-item border-top-light pt-medium">
                  <h5 class="font-bold text-main">Xlsx Parser 구현</h5>
                  <p class="text-body">
                    Excel.js를 기반으로 use case에 최적화된 parser를
                    구현했습니다. 셀과 테이블의 스타일을 기반으로 식별하여
                    스캐닝했습니다.
                  </p>
                </div>
                <div class="update-item border-top-light pt-medium">
                  <h5 class="font-bold text-main">
                    Xlsx To DataFrameTable 구현
                  </h5>
                  <p class="text-body">
                    파싱한 데이터를 DataFrameTable로 변환하는 Transformer를
                    구현했습니다.
                  </p>
                </div>
                <div class="update-item border-top-light pt-medium">
                  <h5 class="font-bold text-main">비즈니스 로직 구현</h5>
                  <p class="text-body">
                    Vue 페이지와 컴포넌트, API, Data Access와 관련된 전반적
                    로직을 팀원들과 구현했습니다.
                  </p>
                </div>
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
          <div class="main-content space-y-xlarge">
            <div class="space-y-medium">
              <h3 class="sub-title">
                설계: 차트 데이터 동기화 기술을 통한 성능 최적화
              </h3>

              <div class="image-placeholder">
                <div class="image-inner">
                  <span class="image-text">Chart Data Sync Architecture</span>
                  <img :src="lgsp2Image" alt="lgsp2" />
                </div>
              </div>

              <p class="text-body mb-small">
                Service Worker와 Indexed DB를 이용해 백그라운드에서 차트
                데이터를 동기화합니다. Frontend에서 요청을 보낼 때는 Indexed
                DB를 먼저 조회하고, 적중하지 않은 경우에만 실제로 서버에
                데이터를 요청합니다.
              </p>
              <p class="highlight-text">
                동기화 알고리즘은 간단한 방식으로 구현했습니다. Frontend에서
                기존에 없는 데이터를 식별한 뒤, 필요한 Chart 데이터의 년, 월
                리스트를 보내면 서버에서 필요한 데이터만 내려줍니다. 트래픽을
                최적화하기 위해 년, 월 리스트는 인코딩하여 요청합니다. 통신
                방식은 HTTP와 Socket 방식 두 가지 경로 옵션을 제공했습니다.
              </p>
            </div>

            <div class="space-y-medium">
              <h3 class="sub-title">구현</h3>
              <div class="p-medium border-light-bg space-y-medium">
                <div class="update-item">
                  <h5 class="font-bold text-main">
                    데이터 동기화를 통한 성능 최적화 로직 구현
                  </h5>
                  <p class="text-body">
                    Service Worker의 prefetching, 부족한 데이터 식별 및 서버
                    요청, 동기화를 위한 서버 API, Indexed DB를 먼저 조회한 뒤
                    서버에 요청하도록 하는 Wrapper Client를 구현했습니다.
                  </p>
                </div>
                <div class="update-item border-top-light pt-medium">
                  <h5 class="font-bold text-main">
                    레거시 엑셀 데이터 Transformer 구현
                  </h5>
                  <p class="text-body">
                    특정 년도 이전 데이터를 시스템에 이전하기 위한 Transformer를
                    만들었습니다. 기존 Xlsx 형식과 달라 별도로 제작하게
                    되었습니다.
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
// Image imports (public directory paths)
const lgsp1Image = "/images/contents_image/lgsp1.webp";
const lgsp2Image = "/images/contents_image/lgsp2.webp";
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

/* ==========================================================================
   Tech Stack Grid (2-column compact layout)
   ========================================================================== */
.tech-stack-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}
@media (min-width: 768px) {
  .tech-stack-grid {
    grid-template-columns: 1fr 1fr;
  }
}
.tech-stack-col {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.tech-stack-card {
  padding: 0;
}
.tech-stack-heading {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: var(--border-light);
}
.tech-stack-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.tech-stack-list li {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-text-gray);
}
.tech-stack-list li strong {
  color: var(--color-text-main);
  font-weight: 600;
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
