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
    </header>

    <!-- Page Content Container -->
    <main class="portfolio-container">
      <!-- =========================================
          SECTION 2: K8S ON-PREMISE
          ========================================= -->
      <section class="section-block border-top-thin pt-xlarge">
        <h2 class="section-title">Infrastructure</h2>

        <div class="layout-grid">
          <aside class="sidebar">
            <h3 class="section-index">01. k8s On-Premise 환경 구축</h3>
            <p class="text-small font-medium mt-small">
              Bare-metal 서버 매입 및 최적화
            </p>
          </aside>

          <div class="main-content space-y-xlarge">
            <!-- Image Placeholder -->
            <div class="image-placeholder">
              <div class="image-inner">
                <span class="image-text">On-Premise Architecture Diagram</span>
                <img :src="devopsImage" alt="devops1" />
              </div>
            </div>

            <div class="space-y-medium">
              <h3 class="sub-title">배경</h3>
              <p class="text-body">
                SaaS로 제공하던 LCA 분석 서비스가 점차 내부 컨설턴트 지원
                서비스로써의 정체성이 커지고, 비즈니스 방향성도 그에 맞게 조정이
                됐습니다. 기존 제품은 LCA를 모르는 초보 분석가가 타겟이었다면,
                이후는 LCA 컨설턴트, 특히 내부 LCA 컨설턴트가 되면서, 제품팀도
                그에 특화된 제품을 기획하고자 했습니다. 그 과정에서, 서비스를
                여전히 AWS에 올리는 것은 비용의 낭비가 크고, 오케스트레이션
                최적화가 어렵다는 문제가 있었습니다. 따라서 최소 비용을 통해
                bare-metal 서버를 매입하여 On-Premise 환경으로 전환하고자
                했습니다.
              </p>
            </div>

            <div class="space-y-medium">
              <h3 class="sub-title">과정</h3>
              <div class="clean-card">
                <span class="tag-pill mb-small">장비 매입과 iPXE 설정</span>
                <p class="text-body mb-small">
                  소규모의 내부 서비스인 만큼, 안정성 보다는 성능을
                  고려했습니다. 범용 PC용 부품에 랙 마운트 폼팩터를
                  선택했습니다. 아직 소형인 만큼, 고성능의 worker node 용 서버
                  1대 와 중간 성능의 worker node용 1대, control plane용 1대를
                  매입했습니다. 비용 한계로 L2 스위치와 기업용 라우터는 구매하지
                  못했습니다.
                </p>
                <p class="text-body mb-small">
                  iPXE 설정을 결정하게 된 이유는 첫 째는, 확장성입니다. iPXE
                  서버만 있으면, 노드 추가 시, 최소한의 uefi 설정 만으로도 기존
                  노드들과 같은 OS 버전으로 부팅이 가능해 집니다. 둘 째는,
                  선정한 OS 떄문입니다. native k8s 환경을 통해 k8s 최적화를 목표
                  했기 때문에, talosOS를 선택했습니다. talos OS는 immutable
                  OS이기도 합니다. iPXE 환경을 구축하지 않으면, 업그레이드를
                  위해서 usb 설치를 물리적으로 해야 합니다. talosOS는 호스트
                  환경 설정도 IaC를 통해 선언적 프로비저닝이 가능하기 때문에,
                  iPXE가 가져다 주는 이점이 큽니다.
                </p>
                <p class="text-body mb-small">
                  iPXE 서버 구축에는 3가지가 필요합니다. 부트로더로 포워딩
                  설정을 할 수 있는 dhcp 서버, 부트로더를 제공하는 tftp 서버,
                  커널 이미지와 initrd를 제공하는 http 서버입니다. 여기서 고민
                  지점은 저희가 가지고 있는 라우터가 가정용 공유기 이기 때문에
                  기존 공유기에서는 dhcp 서버 설정이 불가능하다는 것이었습니다.
                  따라서, iPXE 서버에 dhcp 서버를 구축 한 후, 공유기의 dhcp
                  서버를 닫고, tftp 서버로 포워딩 하도록 설정 했습니다.
                </p>
                <p class="text-body">
                  그리고 tftp 서버를 구축 후, 커널 파라메터를 설정 한 부트
                  로더를 로드 하고, nginx로 http 서버를 구성 후, 커널과 initrd를
                  로드 했습니다. 추가로, L2 스위치 대안으로 각 노드의 uefi에서
                  vlan을 설정하여, 트래픽을 제어했습니다.
                </p>
              </div>

              <div class="clean-card">
                <span class="tag-pill mb-small">Host 및 k8s 설정</span>
                <p class="text-body">
                  talosOS의 machineConfig와 k8s의 kubeConfig를 설정합니다. 기본
                  설정 베이스에 https 통신을 위한 둘 다 선언적 프로비저닝이 가능
                  하기 때문에, git를 통해 버저닝을 했습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =========================================
          SECTION 3: IAC MIGRATION
          ========================================= -->
      <section class="section-block border-top-thin pt-xlarge">
        <h2 class="section-title">IaC Migration</h2>

        <div class="layout-grid">
          <aside class="sidebar">
            <h3 class="section-index">02. IaC 마이그레이션</h3>
            <p class="text-small font-medium mt-small">
              Terraform & Terramate 기반 선언적 체계 전환
            </p>
          </aside>

          <div class="main-content space-y-xlarge">
            <div class="space-y-medium">
              <h3 class="sub-title">배경</h3>
              <p class="text-body">
                Provisioning & Orchestration 을 포함한 Infrastructure 관리
                환경을 Terraform & Terramate 기반의 선언적 체계로 전환했습니다.
                aws console & aws cli를 통한 관리에서는 전체 Infrastructure를
                조망하기 어렵고 상태를 파악하고 관리하기 어려웠습니다. 또한 작업
                도중 시행 착오가 발생 해도, 어떤 행위와 요소 때문에 문제 현상이
                발생 했는지, 원인을 알기 어려운 문제도 있었습니다. 또한,
                Provisioning & Orchestration을 일정 이상 최적화하고 자동화 하기
                어려운 한계가 있었습니다.
              </p>
            </div>

            <div class="space-y-medium">
              <h3 class="sub-title">전환 과정 및 결과</h3>
              <div class="clean-card">
                <span class="tag-pill mb-small"
                  >관심사 기반의 Infrastructure 분리</span
                >
                <p class="text-body">
                  terramate를 사용하면, 하나의 workspace 안에서 Stack이란
                  개념으로 Infrastructure를 계층화 할 수 있습니다. 또한, 여러
                  스택을 분리해서 관리할 수 있습니다. 앱 배포와 관련된 경우,
                  vpc, subnet, elb, ecs, ecr, iam 등을 계층화 하고, terramate
                  환경 변수로 상호작용 할 수 있는 체계를 만들었습니다.
                </p>
              </div>

              <div class="clean-card">
                <span class="tag-pill mb-small">마이그레이션</span>
                <p class="text-body">
                  console & cli로 관리 되고 있던 infrastructure의 상태를
                  terraform의 state로 import 하였습니다. 상태 그대로를 온전히
                  이전시키면, 최적화된 구조로 이전할 수 없기 때문에, 부득이하게
                  재생성을 해야 하는 경우, 위험을 고립 시킨 상태에서, IaC에
                  최적화 된 구조로 재구성 했습니다.
                </p>
              </div>

              <div class="clean-card">
                <span class="tag-pill mb-small">모듈화</span>
                <p class="text-body">
                  ecs는 여러 서비스와 상호작용하여 provisioning 됩니다.
                  보편적으로 자주 사용되는 서비스와 변수를 정하여, 하나의
                  terraform 모듈로 정의했습니다.
                </p>
              </div>

              <div class="clean-card">
                <span class="tag-pill mb-small">플랫폼 엔지니어링</span>
                <p class="text-body mb-small">
                  개발자가 직접 Infrastructure에 접근 하는 것은 업무 맥락 분산,
                  숙련도 부족, 실수에 의한 리스크 문제가 있습니다. 그래서
                  개발자가 최소한의 배포 지식과 수행을 통해서 앱을 안정적으로
                  배포할 수 있는 환경을 만들었습니다.
                </p>
                <p class="text-body mb-small">
                  terramate cli, terraform cli, shell script를 사용해 직접
                  Provisioning & Orchestration 하는 주요 시나리오를 설정합니다.
                  쉽게 시나리오를 수행할 수 있도록 interactive interface 형식의
                  스크립트를 작성했습니다.
                </p>
                <p class="text-body mb-small">
                  git action 스크립트를 IaC를 이용 할 수있게 수정합니다. 또한,
                  스크립트를 git action에서 사용하기 위한 버전을 별도로
                  만듭니다.
                </p>
                <p class="text-body">
                  개발자 입장에서, 증분을 배포하는 경우는 경험이 크게 바뀌지
                  않았지만, 새로 생성해야 하는 경우, 쉽고 안정적으로 생성 및
                  배포 가능하게 바뀌었습니다. 또한, 배포 속도가 개선 되었습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =========================================
          SECTION 4: IAM & SSO
          ========================================= -->
      <section class="section-block border-top-thin pt-xlarge">
        <h2 class="section-title">IAM & SSO</h2>

        <div class="layout-grid">
          <aside class="sidebar">
            <h3 class="section-index">03. 독립적인 IAM 환경 구축</h3>
            <p class="text-small font-medium mt-small">
              Keycloak 기반 인증 센터 및 리버스 프록시
            </p>
          </aside>

          <div class="main-content space-y-xlarge">
            <div class="space-y-medium">
              <h3 class="sub-title">배경</h3>
              <p class="text-body">
                프로젝트 진행 양상이 MVP로 시작해서 계약 후 운영 및 VOC 대응인
                경우가 많았습니다. 이후에는 MVP를 동시다발적으로 구현해야 하는
                상황으로 바뀌어가기도 했습니다. 그 과정에서 보안과 관련한
                요구사항이나 확장은 이후에 이뤄지는 경우가 많았습니다.
              </p>
              <p class="text-body">
                b2b 비즈니스 특성상, 보안 기능은 최소 구현이라도 어느 정도
                수준을 유지 해야 했습니다. 따라서, 단기적으로 작업하기에는 다른
                기능들에 비해 다소 시간이 걸리는 점과 어떤 비즈니스에서도
                공통적인 문제영역인 점, 장기적으로, MSA, MicroFrontend 환경으로
                전환하고자 하는 계획이 있었기 때문에, 독립적인 인증 센터를 구축
                해야겠다고 생각했습니다.
              </p>
            </div>

            <div class="space-y-medium">
              <h3 class="sub-title">구현 사항</h3>
              <div class="clean-card">
                <span class="tag-pill mb-small">Keycloak 구성 및 배포</span>
                <p class="text-body mb-small">
                  처음에는 저희 개발 가치에 따라, 직접 IAM 서비스 구현을
                  고려했지만, oidc와 인가 시스템을 표준에 맞게 구현하기에는
                  규모가 너무 크다고 생각이 들었고, Keycloak은 이미 해당
                  기능들에 대해 표준을 준수하여 구현 했기 때문에, 적합하다고
                  판단하여, Keycloak을 채택하고 구성했습니다.
                </p>
                <p class="text-body mb-small">
                  구성은 keycloak.conf 파일을 통해 수행합니다. Keycloak 설정
                  파일을 통해 구성하면, Keycloak Docker Image를 사용하여
                  배포하더라도, 전체 구성을 포함할 수 있습니다. 사용자에게 노출
                  될 로그인 페이지를 BI를 포함하여 구현, 포함해 줍니다.
                </p>
                <p class="text-body">
                  배포 후에는, Realm 설정과 인가에 필요한 설정을 관리자
                  페이지에서 진행합니다.
                </p>
              </div>

              <div class="clean-card">
                <span class="tag-pill mb-small">리버스 프록시 구현</span>
                <p class="text-body mb-small">
                  인증 처리를 담당하는 리버스 프록시를 구현합니다. 리버스
                  프록시에서 구현한 기능은 다음과 같습니다.
                </p>
                <ul
                  class="text-body space-y-small"
                  style="list-style-type: disc; margin-left: 1.25rem"
                >
                  <li>JWKS을 이용한 ID Token 검증</li>
                  <li>
                    유효하지 않은 사용자를 Keycloak의 User Endpoint로 Redirect
                  </li>
                  <li>
                    Session ID와 ID Token을 Key-Value로 관리하고, 사용자에게
                    Session ID 발급
                  </li>
                  <li>Access Token을 이용하여 RPT 발급 및 관리</li>
                </ul>
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
      </div>
    </footer>
  </div>
</template>

<script setup>
// Image imports using new URL for proper Vite handling
const devopsImage = new URL(
  "../../../../images/contents_image/devops1.webp",
  import.meta.url,
).href;
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
