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
      <div class="meta-filters"></div>
    </header>

    <!-- Page Content Container -->
    <main class="portfolio-container">
      <!-- =========================================
          SECTION 1: TECH STACK 
          ========================================= -->
      <section class="section-block">
        <h2 class="section-title">Tech Stack</h2>

        <div class="layout-grid">
          <aside class="sidebar">
            <h3 class="section-index">01. 기술</h3>
            <p class="text-small text-gray mt-small">
              모노레포 기반의 풀스택 웹 애플리케이션 개발을 위한 기술
              스택입니다.
            </p>
          </aside>

          <div class="main-content">
            <div class="cards-grid border-top-thin pt-large">
              <!-- Architecture -->
              <div class="clean-card">
                <h4 class="card-title">🏗️ 아키텍처 & 도구</h4>
                <ul class="tech-list">
                  <li><strong>Nx 18</strong> - 모노레포 관리</li>
                  <li><strong>Yarn 4</strong> - 패키지 매니저</li>
                  <li><strong>Docker & Compose</strong> - 개발/배포 환경</li>
                </ul>
              </div>

              <!-- Frontend -->
              <div class="clean-card">
                <h4 class="card-title">🎯 프론트엔드</h4>
                <ul class="tech-list">
                  <li><strong>Nuxt 3</strong> - SSR 풀스택 프레임워크</li>
                  <li><strong>Vue 3</strong> - UI 라이브러리</li>
                  <li><strong>Vite</strong> - 번들러</li>
                  <li><strong>Pinia</strong> / <strong>Vue Router</strong></li>
                  <li><strong>@vite-pwa/nuxt</strong> - PWA 지원</li>
                </ul>
              </div>

              <!-- Backend -->
              <div class="clean-card">
                <h4 class="card-title">🔐 백엔드</h4>
                <ul class="tech-list">
                  <li><strong>NestJS 10</strong> - 서버 프레임워크</li>
                  <li><strong>GraphQL</strong> - Apollo, graphql-upload</li>
                  <li><strong>TypeORM 0.3</strong> - ORM</li>
                  <li><strong>PostgreSQL</strong> - 데이터베이스</li>
                  <li><strong>Passport.js & JWT</strong> - 인증</li>
                </ul>
              </div>

              <!-- Test & Quality -->
              <div class="clean-card">
                <h4 class="card-title">🧪 테스트 & 품질</h4>
                <ul class="tech-list">
                  <li><strong>Jest</strong> - 단위/통합 테스트</li>
                  <li><strong>Vitest</strong> - Vue 컴포넌트 테스트</li>
                  <li><strong>Storybook 8</strong> - UI 컴포넌트 카탈로그</li>
                </ul>
              </div>

              <!-- Code Quality -->
              <div class="clean-card">
                <h4 class="card-title">📝 코드 품질</h4>
                <ul class="tech-list">
                  <li><strong>TypeScript 5.4</strong> - 정적 타입</li>
                  <li><strong>ESLint & Prettier</strong> - 린팅/포매팅</li>
                  <li><strong>Oxlint</strong> - 고성능 린터</li>
                  <li><strong>Husky & lint-staged</strong> - Git 훅</li>
                </ul>
              </div>

              <!-- Data & Cloud -->
              <div class="clean-card">
                <h4 class="card-title">📊 데이터 & ☁️ 클라우드</h4>
                <ul class="tech-list">
                  <li><strong>ExcelJS / docx</strong> - 문서 생성/처리</li>
                  <li><strong>Multer</strong> - 파일 업로드</li>
                  <li><strong>Chart.js</strong> - 차트/그래프</li>
                  <li><strong>AWS SDK</strong> - S3, SES</li>
                  <li><strong>Channel.io / Hotjar</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =========================================
          SECTION 2: INITIAL DEVELOPMENT 
          ========================================= -->
      <section class="section-block border-top-thin pt-xlarge">
        <h2 class="section-title">Initial Development</h2>

        <div class="layout-grid">
          <aside class="sidebar">
            <h3 class="section-index">02. 제품 최초 개발</h3>
            <p class="text-small font-medium mt-small">
              기간: 2024/03 ~ 2024/06
            </p>
          </aside>

          <div class="main-content space-y-xlarge">
            <!-- 아키텍쳐 설계와 도메인 모델링 -->
            <div>
              <h3 class="sub-title">아키텍쳐 설계와 도메인 모델링</h3>

              <!-- Image Placeholder for 'image.png' -->
              <div class="image-placeholder mt-large mb-large">
                <div class="image-inner">
                  <span class="image-text">Domain Modeling Diagram</span>
                  <img
                    src="/assets/images/contents_image/lync1.webp"
                    alt="lync1"
                  />
                </div>
              </div>

              <div class="space-y-medium text-body">
                <p>
                  사내 LCA 컨설턴트와 반복적 인터뷰를 거쳐 도메인을 모델링하고,
                  도메인 집약적 상호작용을 구현 가능한 알고리즘으로
                  풀어냈습니다. 모델링의 가장 큰 기준은 최대한 LCA 이론의 개념적
                  얼개를 준수하는 것이었습니다. 따라서 실행 가능성과 배치되는
                  부분이 생겼을 때, 기준을 더 우선시 하였습니다. 한 번에 완성된
                  제품을 만드는 것이 아니고 점진적 개선과 확장을 전제로 했기
                  때문에 가능한 결정이었습니다.
                </p>
                <p>
                  백엔드 애플리케이션 아키텍쳐는 레이어드 아키텍쳐를
                  채택했습니다. 그리고 도메인 레이어를 핵심으로 두어, 다른
                  레이어들의 구조적 최적화가 도메인 레이어와 상충되는 경우
                  도메인 레이어를 우선적으로 고려하도록 했습니다. 다음의
                  기준으로는 최대한 확장과 변경이 신속한 구조를 만들면서도,
                  이슈가 발생했을 때 원인을 알 수 있도록 SoC와 타입을 활용하여
                  이슈가 발산하지 못하는 균형점을 유지하는 것이었습니다.
                </p>
                <p>
                  프론트엔드는 SoC에 최대한 초점을 맞춰 코드 및 파일 레벨
                  아키텍쳐를 구성했습니다. Atomic System을 통한 Component 분류,
                  추상 Component와 구상 Component의 분류, View와 Component의
                  분류, 통신 책임의 제한, Store와 Composable, Inject/Provide가
                  사용 가능한 사례를 명확히 했습니다.
                </p>
                <p class="highlight-text mt-large">
                  아키텍쳐 설계와 도메인 모델링의 기준이 되는 비즈니스 배경이
                  있습니다. 제품이 시장 검증 목적과 세일즈의 목적의 성질을
                  동시에 띠었습니다. 세일즈의 경우에도 대전략 하에 판촉이 되는
                  형태가 아니라 실험적으로 세일즈가 되던 형태였습니다. 미리
                  제품의 정체성을 가지고 시작하기보다, VOC에 따라 정체성을
                  포함한 모든 것이 시시각각 바뀔 수 있다는 전제를 포함하고
                  있었습니다.
                </p>
              </div>
            </div>

            <!-- 구현 및 DevOps -->
            <div class="border-top-thin pt-large">
              <h3 class="sub-title mb-large">구현 및 인프라</h3>

              <div class="cards-grid">
                <div class="clean-card">
                  <span class="tag-pill mb-small">도메인 로직</span>
                  <h4 class="card-title">도메인 및 관련 로직 구현</h4>
                  <p>
                    설계에 따라 도메인 로직을 구현했습니다. 도메인 로직과 관련한
                    API와 DB 접근 로직을 팀원들과 같이 구현했습니다.
                  </p>
                </div>
                <div class="clean-card">
                  <span class="tag-pill mb-small">Full Stack</span>
                  <h4 class="card-title">Cutoff & Impact Score 연결</h4>
                  <p>
                    GtG 분석의 마지막 단계에서 수행하는 Cutoff와 Impact Score
                    연결과 관련된 시나리오를 Full stack으로 구현했습니다.
                  </p>
                </div>
                <div class="clean-card">
                  <span class="tag-pill mb-small">Frontend</span>
                  <h4 class="card-title">추상 컴포넌트 설계 및 구현</h4>
                  <p>
                    디자인 시스템 컴포넌트를 Vue Component로 설계하고 팀원들과
                    같이 구현했습니다. 추상 컴포넌트는 구상 컴포넌트를
                    구현하는데 사용되는 만큼, 인터페이스가 다소 복잡하지만
                    범용성을 추구하도록 설계했습니다.
                  </p>
                </div>
              </div>

              <div class="mt-large p-medium border-light-bg space-y-small">
                <h4 class="font-bold">DevOps</h4>
                <p class="text-body">
                  Git Action을 통해 GitOps 환경을 구성했습니다. S3, RDS 등을
                  포함한 리소스의 Provisioning과 Orchestration은 AWS Console과
                  AWS CLI를 통해 수행했습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =========================================
          SECTION 3: OPERATIONS & UPDATES 
          ========================================= -->
      <section class="section-block border-top-thin pt-xlarge">
        <h2 class="section-title">Operations & Updates</h2>

        <div class="layout-grid">
          <aside class="sidebar">
            <h3 class="section-index">03. 제품 운영 및 업데이트</h3>
            <p class="text-small font-medium mt-small">기간: 2024/03 ~</p>
          </aside>

          <div class="main-content space-y-xlarge">
            <!-- Customized Area Plugin 패턴 설계 -->
            <div>
              <h3 class="sub-title">Customized Area Plugin 패턴 설계</h3>

              <div class="space-y-medium text-body mt-large">
                <h4 class="font-bold text-main">배경</h4>
                <p>
                  최초 개발 당시 비즈니스 스탠스에 따라 제품 정체성이 모호한
                  상황에서, 여러 고객들의 요구를 SaaS 서비스에 동시 다발적이고
                  즉각적으로 Customize 하는 상황이 전개됐습니다. 최대한 변경을
                  지양하고 확장을 추구했지만, 최초 설계한 도메인 모델이 충분히
                  책임 분리되어 있지 않음에 더하여 리팩토링할 자원을 투자하기
                  어려운 상황이었습니다. 따라서 변경되는 상황으로 나아가는 힘을
                  제어하기 어려운 부분이 있었습니다.
                </p>
                <p>
                  대부분은 파일과 모듈 레벨의 SoC를 통해 해결이 되었지만, 앱의
                  여러 페이지에 걸쳐서 변경이 이뤄져야 하는 경우에 문제가
                  됐습니다. 그래서 Customizing 하는 부분을 파일과 모듈을 넘어서
                  패턴적으로 분리해 내려고 했습니다.
                </p>
                <p>
                  Frontend에는 Drawer라는 인터렉션을 전역 레이아웃에 포함하여
                  서비스 흐름과 다른 레이어에서 컨트롤 하고자 하는 요구사항을
                  충족하고자 했으며, 별도의 서비스로서 수행 가능한 기능들은
                  TopNavBar의 항목에 추가하도록 했습니다. 또한 이렇게 추가되는
                  기능은 자체적으로 설계한 Plugin 인터페이스를 통해 App에
                  등록해야만 합니다. 서비스는 또한 독립적인 코드베이스를 가져야
                  합니다.
                </p>
                <p>
                  백엔드의 경우 Nest.js의 모듈 시스템을 사용하기 때문에 혼란이
                  적지만, 그럼에도 모듈명이나 디렉토리 구조적으로 충분히
                  격리되도록 했습니다. 우리가 처한 카오스 속에서는 모듈 트리의
                  의존성이 어느 순간 일방향이 아니게 되는 경우가 발생할 수
                  있었기 때문입니다.
                </p>
                <p class="highlight-text">
                  이 기술 기획은 도메인과 애플리케이션 아키텍쳐 레벨의
                  리팩토링에 본격적으로 자원을 투자하기 어려운 상황에서, 문제를
                  해결할 수 있는 과도기적 솔루션으로써 적용했습니다. 팀
                  차원에서의 변경 오염을 구조적으로 차단하고, 고객 성공
                  매니저에게 VOC에 따라 대응할 수 있는 전제 조건을 설득하고
                  조율할 수 있었습니다.
                </p>
              </div>
            </div>

            <!-- 플러그인 구현 및 등록 절차 -->
            <div class="border-top-thin pt-large">
              <h3 class="sub-title">플러그인 구현 및 등록 절차</h3>

              <!-- Image Placeholder for 'image.png' -->
              <div class="image-placeholder mt-large mb-large">
                <div class="image-inner">
                  <span class="image-text">Plugin Implementation Workflow</span>
                  <img
                    src="/assets/images/contents_image/lync2.webp"
                    alt="lync2"
                  />
                </div>
              </div>

              <div class="cards-grid">
                <div class="clean-card">
                  <h4 class="card-title text-main">DrawerPlugin Component</h4>
                  <p>
                    DrawerPlugin을 구현하기 위한 최소 규격을 구현한 추상
                    Component입니다. 구상 DrawerPlugin은 기능을 구현한 후 사양을
                    pluginInfo 오브젝트에 기입하여 DrawerPlugin의 Prop으로
                    전달합니다.
                  </p>
                </div>
                <div class="clean-card">
                  <h4 class="card-title text-main">DrawerPluginManager</h4>
                  <p>
                    구상 DrawerPlugin 목록을 앱에 등록하기 위한 Vue Plugin
                    입니다. pluginInfo 오브젝트 목록을 받아 앱에서 제어할 수
                    있도록 인터페이스를 전역 Provide로 제공합니다.
                  </p>
                </div>
                <div class="clean-card">
                  <h4 class="card-title text-main">승인 체계 Drawer Plugin</h4>
                  <p>
                    한 고객사의 업무 승인 결재 프로세스를 반영한 기능을 Drawer
                    Plugin으로 구현했습니다. App 전역에서 영향을 미치므로 App의
                    핵심 로직을 변경하지 않고 다른 레이어로서 상호작용 할 수
                    있도록 의도했습니다.
                  </p>
                </div>
                <div class="clean-card">
                  <h4 class="card-title text-main">요청 관리 Drawer Plugin</h4>
                  <p>
                    고객사 업무 프로세스에서 프로세스 마다 담당 직원이 달라지는
                    부분을 고려한 Customized 기능입니다.
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
          <p class="text-gray-light">© 2024 All rights reserved.</p>
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
