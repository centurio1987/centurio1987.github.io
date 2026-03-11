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
          SECTION 1: JS MODULES
          ========================================= -->
      <section class="section-block">
        <h2 class="section-title">JS Modules</h2>

        <div class="layout-grid">
          <aside class="sidebar">
            <h3 class="section-index">01. 공통 라이브러리 추상화</h3>
            <p class="text-small font-medium mt-small">
              팀 내에서 자주 사용하는 기능들을 추상화하여 npm package로
              관리했습니다.
            </p>
          </aside>

          <div class="main-content space-y-xlarge">
            <div class="space-y-medium">
              <!-- Date 확장 -->
              <div class="clean-card">
                <span class="tag-pill mb-small">Date</span>
                <h4 class="card-title">Date 확장 모듈</h4>
                <p class="text-body mb-medium">
                  Date 객체를 확장하여 Python의 <code>strftime</code>과 유사한
                  인터페이스의 format 함수를 구현했습니다.
                </p>
                <div class="code-block">
                  <pre><code>expect(date.format('%y년 %m월 %d일, %H:%M:%S')).toBe(
  `${date.getFullYear()}년 ${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}월 ${date.getDate()
    .toString()
    .padStart(2, '0')}일, ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
);</code></pre>
                </div>
              </div>

              <!-- Array Object 확장 -->
              <div class="clean-card">
                <span class="tag-pill mb-small">Array</span>
                <h4 class="card-title">Array Object 확장</h4>
                <p class="text-body mb-medium">
                  JS 기본 배열에 Python 스타일의 <code>zip</code>,
                  <code>min</code>, <code>max</code>, <code>range</code> 등
                  유틸리티 함수를 추가한 ExtendedArray 클래스를 설계했습니다.
                </p>
                <div class="code-block">
                  <pre><code>const numExArray = new ExtendedArray(1, 2, 3);
expect(numExArray.zip([1, 2, 3])).toEqual(
  expect.arrayContaining([
    [1, 1], [2, 2], [3, 3]
  ])
);</code></pre>
                </div>
              </div>

              <!-- Error 확장 -->
              <div class="clean-card">
                <span class="tag-pill mb-small">Error</span>
                <h4 class="card-title">Error 객체 고도화</h4>
                <p class="text-body mb-medium">
                  Error 클래스를 확장하여 에러 코드, 발생 인스턴스명, 함수명
                  등을 구조화하여 디버깅 효율을 높였습니다.
                </p>
                <div class="code-block">
                  <pre><code>throw new CustomError&lt;DomainErrorCode&gt;({
  message: 'critical error',
  code: 'INVARIANT_FAILED',
  instance: Sample.name,
  func: Sample.prototype.sample.name,
});
// Output: [Sample:sample]INVARIANT_FAILED: critical error</code></pre>
                </div>
              </div>

              <!-- i18n 모듈 -->
              <div class="clean-card">
                <span class="tag-pill mb-small">i18n</span>
                <h4 class="card-title">경량 i18n 모듈 구현</h4>
                <p class="text-body mb-medium">
                  토큰 치환 기능과 중첩 객체 조회를 지원하는 다국어 관리
                  매니저를 직접 구현하여 외부 라이브러리 의존성을 줄였습니다.
                </p>
                <div class="code-block">
                  <pre><code>const i18n = new I18nManager({ locale: 'ko', i18nDocs: [...] });
expect(i18n.t('profile.welcome2', {
  token: [
    { key: 'name', value: 'yoondeok' },
    { key: 'company', value: '샘플' }
  ]
})).toBe('안녕하세요, yoondeok님!, 샘플에 오신 것을 환영합니다.');</code></pre>
                </div>
              </div>

              <!-- Cursor Pagination -->
              <div class="clean-card">
                <span class="tag-pill mb-small">Pagination</span>
                <h4 class="card-title">Cursor Pagination Manager</h4>
                <p class="text-body mb-medium">
                  복합 키 기반의 커서 인코딩/디코딩 및 Where 절 파싱 로직을
                  추상화하여 반복적인 페이지네이션 구현 패턴을 효율화했습니다.
                </p>
                <div class="code-block">
                  <pre><code>const cursor = CursorManager.encodeCursor({ kvList });
const decoded = CursorManager.decodeCursor(cursor);
const whereClause = CursorManager.generateWherePhraseUnit(decoded, 0, '>');</code></pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =========================================
          SECTION 2: VUE COMPONENTS
          ========================================= -->
      <section class="section-block border-top-thin pt-xlarge">
        <h2 class="section-title">Vue Components</h2>

        <div class="layout-grid">
          <aside class="sidebar">
            <h3 class="section-index">02. UI 컴포넌트 추상화</h3>
            <p class="text-small font-medium mt-small">
              반복되는 UI 패턴을 선언적 컴포넌트로 분리하여 생산성을
              극대화했습니다.
            </p>
          </aside>

          <div class="main-content space-y-xlarge">
            <div class="space-y-medium">
              <!-- Infinity Scroll -->
              <div class="clean-card">
                <span class="tag-pill mb-small">UX</span>
                <h4 class="card-title">Infinity Scroll List 추상 컴포넌트</h4>
                <p class="text-body">
                  <code>IntersectionObserver</code>를 캡슐화한 컴포넌트입니다.
                  데이터 패치 로직을 주입받아 리스트의 하단 경계 관측 시
                  자동으로 다음 페이지를 로드하는 인터페이스를 제공합니다.
                </p>
              </div>

              <!-- Chart -->
              <div class="clean-card">
                <span class="tag-pill mb-small">Visualization</span>
                <h4 class="card-title">Chart.js 추상화 컴포넌트</h4>
                <p class="text-body mb-medium">
                  Chart.js의 복잡한 옵션을 빌더 패턴으로 생성할 수 있도록
                  설계했습니다. 사용자는 차트 내부 로직을 몰라도 빌더를 통해
                  안정적으로 시각화 요소를 구성할 수 있습니다.
                </p>
                <div class="highlight-text">
                  Builder Pattern을 적용하여 설정값의 누락을 방지하고 타입
                  안정성을 확보했습니다.
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
// 순수 프레젠테이션용 정적 컴포넌트입니다.
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
  --color-code-bg: #1e1e1e;
  --color-code-text: #d4d4d4;

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

.code-block {
  background-color: #1e1e1e;
  border-radius: 6px;
  padding: 1rem;
  overflow-x: auto;
  margin-top: 1rem;
}
.code-block pre {
  margin: 0;
  font-family: "Fira Code", "Courier New", monospace;
  font-size: 0.85rem;
  color: #d4d4d4;
  line-height: 1.5;
}

.border-light-bg {
  background-color: var(--color-bg-muted);
  border-radius: 8px;
  border: 1px solid var(--color-border-light);
}

.p-medium {
  padding: 1.5rem;
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
