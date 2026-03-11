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
          SECTION 1: STRATEGY THEME
          ========================================= -->
      <section class="section-block">
        <h2 class="section-title">Strategy Theme</h2>

        <div class="layout-grid">
          <aside class="sidebar">
            <h3 class="section-index">01. 배경이 되는 전략 테마 정의</h3>
            <p class="text-small font-medium mt-small">
              전략 방향성 수립 및 상위 전략 정렬
            </p>
          </aside>

          <div class="main-content space-y-xlarge">
            <div class="space-y-medium">
              <p class="text-lead">
                전략의 테마는 추구하는 전략 방향성을 알려 주어 경영진과
                실무진에게 예측 가능성을 제공하고, 하위 전략의 맥락을 유추하는
                단서가 됩니다.
              </p>
              <p class="text-body">
                또한 심상을 제공하여 전략 주체의 의도가 더 잘 전달되고 공유되어,
                업무 혼선과 갈등을 줄일 수 있습니다. 전략 주체가 앞으로 전략을
                구상하는 데 있어 길잡이가 되어 주기도 하며, 경영 및 비즈니스
                전략과 같은 상위 전략과의 개연성을 이어 주고 정렬하는 장치로서
                작용합니다.
              </p>

              <div class="space-y-medium pt-large border-top-thin">
                <div class="clean-card">
                  <span class="tag-pill mb-small">환경 분석</span>
                  <h4 class="card-title">거시적 및 내부 환경 진단</h4>
                  <p class="text-body">
                    경영 전략과 MVC, 비즈니스에서 타기팅하는 시장 규모와 조사된
                    마켓핏, 자사의 런웨이, 역량, 유사 환경의 조직 사례 등을
                    고려했습니다. 시장의 협소성, 시장 공략 우선 기조, 자원의
                    한계를 중점적으로 분석했습니다.
                  </p>
                </div>

                <div class="clean-card">
                  <span class="tag-pill mb-small">테마 정의</span>
                  <h4 class="card-title">두 가지 핵심 전략 테마</h4>
                  <ul
                    class="text-body space-y-small"
                    style="list-style-type: disc; margin-left: 1.25rem"
                  >
                    <li>
                      <strong>기술 주도형 전략:</strong> 여러 시장에 기술적 경쟁
                      우위를 만들 수 있는 입지 형성.
                    </li>
                    <li>
                      <strong>도메인 특화 전략:</strong> 목표 시장 잠식 및
                      성장을 기반으로 유사 시장 다각화 가능성 확보.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =========================================
          SECTION 2: PRODUCT DISCOVERY
          ========================================= -->
      <section class="section-block border-top-thin pt-xlarge">
        <h2 class="section-title">Product Discovery</h2>

        <div class="layout-grid">
          <aside class="sidebar">
            <h3 class="section-index">02. 제품 발견 및 리서치</h3>
            <p class="text-small font-medium mt-small">
              현장 관찰 기반의 가치 확인
            </p>
          </aside>

          <div class="main-content space-y-xlarge">
            <div class="space-y-medium">
              <p class="text-lead">
                전략 테마를 정한 시점에서 우리 상황을 진단할 필요가 있었습니다.
                내부 컨설턴트 인터뷰와 VOC, 시장 조사를 통해 PMF가 얼라인되는
                가치를 확인하고 제품을 정의했습니다.
              </p>

              <div class="space-y-medium mt-large">
                <!-- 리서치 내용 -->
                <div class="clean-card">
                  <span class="tag-pill mb-small">데스크 리서치</span>
                  <p class="text-body">
                    경영진을 통해 상위 전략과 MVC를 확인하고, 비즈니스 팀을 통해
                    리드의 목소리, 시장 조사, 경쟁 분석을 바탕으로 마켓핏을
                    퍼널링했습니다.
                  </p>
                </div>

                <div class="clean-card">
                  <span class="tag-pill mb-small">사용자 리서치</span>
                  <h4 class="card-title">IDI & Observation & Work Modeling</h4>
                  <p class="text-body mb-small">
                    LCA 분석을 주로 수행하는 내부 컨설팅 팀을 대상으로 인터뷰와
                    관찰을 진행했습니다. 핵심은 작업 프로세스를 깊이 있게
                    이해하고 공감하는 것이었습니다.
                  </p>
                  <p class="highlight-text">
                    질문의 관점을 인지, 행동, 감정, 맥락으로 정하여 실무에
                    입각한 개선안을 도출했습니다.
                  </p>
                </div>

                <div class="clean-card">
                  <span class="tag-pill mb-small">데이터 모델링</span>
                  <h4 class="card-title">Affinity Diagram & HMW</h4>
                  <p class="text-body mb-small">
                    비슷한 유형의 질답과 문제를 클러스터링하고, 5whys 형식을
                    통해 근본 원인을 추론했습니다. Affinity Diagram을 통해
                    Artifact를 갈무리하고, HMW(How Might We) 도구를 사용하여
                    문제를 제품 특화 문장으로 치환했습니다.
                  </p>
                  <p class="text-body">
                    기계적 분류보다 공감한 사용자 맥락을 머릿속에서 스키마로
                    구성하여 목표 문제를 식별하는 데 집중했습니다.
                  </p>
                </div>

                <div class="clean-card">
                  <span class="tag-pill mb-small">Ideation</span>
                  <h4 class="card-title">Solution 퍼널링</h4>
                  <p class="text-body">
                    브레인스토밍과 Crazy 8 도구를 사용해 솔루션을 찾고, 2x2
                    매트릭스를 통해 노력 대비 효과가 높은 솔루션을 정렬했습니다.
                    최종 산출물은 As-is, To-be 형태로 정리하여 제품화 전략의
                    핵심 자료로 활용했습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =========================================
          SECTION 3: PRODUCT STRATEGY & PLANNING
          ========================================= -->
      <section class="section-block border-top-thin pt-xlarge">
        <h2 class="section-title">Planning & Definition</h2>

        <div class="layout-grid">
          <aside class="sidebar">
            <h3 class="section-index">03. 제품화 전략, 정의 및 기획</h3>
            <p class="text-small font-medium mt-small">
              핵심 가치 제안 및 아키텍처 설계
            </p>
          </aside>

          <div class="main-content space-y-xlarge">
            <div class="space-y-medium">
              <div class="clean-card">
                <span class="tag-pill mb-small">전략</span>
                <h4 class="card-title">제품화 전략: 프로세스 최적화</h4>
                <p class="text-body mb-small">
                  시장 전달물을 '제품 직접 제공'이 아닌 '컨설팅 서비스 제공'으로
                  정하고, 제품은 내부 컨설팅 역량 강화에 초점을 맞춰 PMF를
                  얼라인했습니다.
                </p>
                <p class="text-body">
                  소프트웨어에 동반한 프로세스 개선 가이드를 퍼실리테이트하고,
                  제품-컨설팅 팀 간 효율적인 접점을 만드는 것으로 가치를
                  제안했습니다.
                </p>
              </div>

              <div class="clean-card">
                <span class="tag-pill mb-small">정의</span>
                <h4 class="card-title">제품 정의 및 MVP 설계</h4>
                <p class="text-body mb-small">
                  정량적 지표보다 컨설팅 팀의 사용자 경험 만족도에 목표를
                  두었습니다. 핵심 문제 영역과 서브 영역을 분리하여 각각 MVP로
                  구성하고 상호작용하게 함으로써 관심사 분리(SoC)를 명확히
                  했습니다.
                </p>
              </div>

              <div class="clean-card">
                <span class="tag-pill mb-small">기획</span>
                <h4 class="card-title">제품 기획: 시나리오 기반 설계</h4>
                <p class="text-body mb-small">
                  생각 가능한 모든 시나리오를 스토리보드로 시뮬레이션하여 최적의
                  경로를 설정했습니다. 이 과정에서 가정 및 한계 사항을 기록하여
                  결정의 근거를 확보했습니다.
                </p>
                <p class="highlight-text">
                  업무 프로세스를 순차적으로만 고려하지 않고, 실무의 반복적
                  특성과 데이터의 지속성을 반영하여 도메인 모델링을
                  수행했습니다.
                </p>
                <p class="text-body mt-small">
                  기술적으로는 데이터 플로우를 만들고 전역 식별성이 있는
                  엔티티를 판단하여, 주체의 모든 가능성을 담은 도메인 모델을
                  설계하는 데 집중했습니다.
                </p>
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
// 프레젠테이션용 정적 컴포넌트입니다.
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
