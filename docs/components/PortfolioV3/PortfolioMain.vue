<template>
  <div :class="['app-root', { dark: isDarkMode }]">
    <div class="app-container">
      <div class="max-w-wrapper">
        <!-- Header Section -->
        <header class="header">
          <div class="nav-actions">
            <div class="social-icons">
              <!-- GitHub SVG -->
              <a
                href="https://github.com/centurio1987"
                class="icon-btn"
                aria-label="GitHub"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
                  />
                </svg>
              </a>
              <!-- LinkedIn SVG -->
              <a
                href="https://www.linkedin.com/in/yoondeok-kim-319bb8145"
                class="icon-btn"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
                  />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>

              <!-- Dark Mode Toggle Button -->
              <button
                @click="toggleDarkMode"
                class="theme-toggle"
                aria-label="Toggle Dark Mode"
              >
                <!-- Sun Icon -->
                <svg
                  v-if="isDarkMode"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
                <!-- Moon Icon -->
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <!-- Hero Title Section -->
        <section class="hero-section">
          <h1 class="hero-title">PORTFOLIO</h1>
        </section>

        <!-- Categories & Filter Section -->
        <section class="filter-section">
          <h2 class="filter-title">CATEGORIES</h2>
          <div class="filter-buttons">
            <button
              v-for="category in categories"
              :key="category"
              @click="activeCategory = category"
              :class="['filter-btn', { active: activeCategory === category }]"
            >
              {{ category }}
            </button>
          </div>
        </section>

        <!-- Grid Section -->
        <section class="portfolio-grid">
          <PortfolioCard
            v-for="item in filteredData"
            :key="item.id"
            :id="item.id"
            :date="item.date"
            :category="item.category"
            :title="item.title"
            :description="item.description"
            :imageUrl="item.imageUrl"
            :skill="item.skill"
            :duration="item.duration"
            @click:card="onClickCard"
          />
        </section>
        <a
          href="https://pretty-sale-848.notion.site/1b6e54a5ea8081b0aaf4f6beb1fc949f?source=copy_link"
        >
          🤣예전 포트폴리오가 궁금하다면?
        </a>
        <PortfolioCardDialog
          ref="modal"
          :date="selectedCardData?.date"
          :category="selectedCardData?.category"
          :title="selectedCardData?.title"
          :description="selectedCardData?.description"
          :imageUrl="selectedCardData?.imageUrl"
          :skill="selectedCardData?.skill"
          :duration="selectedCardData?.duration"
        >
          <KeepAlive>
            <component :is="selectedCardData?.contents" />
          </KeepAlive>
        </PortfolioCardDialog>
      </div>

      <!-- Footer minimal -->
      <footer class="footer">
        <p>Respect to my team.</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, useTemplateRef } from "vue";
import PortfolioCard from "./PortfolioCard/PortfolioCard.vue";
import LyncCardContents from "./PortfolioContentsCard/PortfolioContents/LyncCardContents.vue";
import PortfolioCardDialog from "./PortfolioCard/PortfolioCardDialog.vue";
import PoolmuganStrategyToPlanningCardContents from "./PortfolioContentsCard/PortfolioContents/PoolmuganStrategyToPlanningCardContents.vue";
import LeadCardContents from "./PortfolioContentsCard/PortfolioContents/LeadCardContents.vue";
import InfrastructureCardContents from "./PortfolioContentsCard/PortfolioContents/InfrastructureCardContents.vue";
import ArchitectureCardContents from "./PortfolioContentsCard/PortfolioContents/ArchitectureCardContents.vue";
import CommonUtilsCardContents from "./PortfolioContentsCard/PortfolioContents/CommonUtilsCardContents.vue";
import ProdOpsCardContents from "./PortfolioContentsCard/PortfolioContents/ProdOpsCardContents.vue";
import LgspCardContents from "./PortfolioContentsCard/PortfolioContents/LgspCardContents.vue";
import LyncMvpCardContents from "./PortfolioContentsCard/PortfolioContents/LyncMvpCardContents.vue";

// --- Asset Imports (public directory paths) ---
const nuxtLogo = "/images/logos/nuxt.svg";
const nestLogo = "/images/logos/nest.svg";
const postgresqlLogo = "/images/logos/postgresql.svg";
const nextLogo = "/images/logos/next.svg";
const vueLogo = "/images/logos/vue.svg";
const terraformLogo = "/images/logos/terraform.svg";
const awsLogo = "/images/logos/aws.svg";
const kubernetesLogo = "/images/logos/kubernetes.svg";
const terramateLogo = "/images/logos/terramate.svg";
const javascriptLogo = "/images/logos/javascript.svg";
const typescriptLogo = "/images/logos/typescript.svg";

const strategyImage = "/images/strategy.webp";
const poolmuganImage = "/images/poolmugan.webp";
const lyncMvpImage = "/images/lync_mvp.webp";
const lgspImage = "/images/lgsp.webp";
const prodOpsImage = "/images/prod_ops.webp";
const devopsImage = "/images/devops.webp";
const architectureImage = "/images/architecture.webp";
const utilsImage = "/images/utils.webp";
const leadImage = "/images/lead.webp";

// --- 1. 실무용 Mock Data 정의 ---
const portfolioData = [
  {
    id: 1,
    date: "Mar. 2025 ~ Jun. 2025 & Jun. 2025 ~",
    category: [
      "Architecture",
      "Product Engineering",
      "Lead",
      "Product Managing",
    ],
    title: "LynC 구현, 관리, 업데이트",
    description:
      "LCA(전과정 평가) 이론을 준수하는 도메인 집약적 모델링을 통해 제품의 기틀을 마련하고, 비즈니스 확장에 유연하게 대응할 수 있는 Customized Plugin 패턴을 설계하여 운영 효율을 극대화했습니다. 초기 시장 검증 단계의 불확실성을 고려해 레이어드 아키텍처와 SoC(관심사 분리)를 철저히 적용했으며, 급격한 고객 요구사항 변화 속에서도 코드 오염을 방지하고 독립적인 기능 확장이 가능한 구조를 구현했습니다.",
    skill: [
      {
        name: "Architecture",
      },
      {
        name: "nuxt",
        logo: nuxtLogo,
      },
      {
        name: "nest",
        logo: nestLogo,
      },
      {
        name: "postgresql",
        logo: postgresqlLogo,
      },
    ],
    duration: "3.5 Months & Go On",
    contents: LyncCardContents,
    imageUrl: strategyImage,
  },
  {
    id: 2,
    date: "Jun. 2026 ~ Aug. 2026",
    category: ["Planning", "Strategy"],
    title: "풀무간 제품 전략부터 기획까지",
    description:
      "기술 주도와 도메인 특화라는 전략 테마를 수립하여 경영과 실무의 예측 가능성을 확보했습니다. 내부 컨설팅 팀 대상의 In-Depth Interview와 관찰을 통해 실무 프로세스를 심층 이해하고, 5Whys와 데이터 모델링으로 핵심 문제를 식별했습니다. 특히 결제권자와 실무자가 다른 시장 특성을 고려해, 제품의 지향점을 '내부 컨설팅 역량 강화'로 설정하여 PMF를 최적화했습니다. 최종적으로 시나리오 시뮬레이션과 도메인 모델링을 거쳐, 비즈니스 로직의 엄밀함과 확장성을 갖춘 MVP 제품화 전략을 도출했습니다.",
    skill: [
      {
        name: "기획",
      },
      {
        name: "전략",
      },
    ],
    contents: PoolmuganStrategyToPlanningCardContents,
    duration: "2 Months",
    imageUrl: poolmuganImage,
  },
  {
    id: 3,
    date: "Jul. 2024 ~ Aug. 2024",
    category: [
      "Architecture",
      "Product Engineering",
      "Lead",
      "Product Managing",
    ],
    title: "LynC MVP 제작",
    description:
      "해외 판촉 및 시장 검증을 목적으로, 제품별 공정 정의와 연결을 인터랙티브하게 수행하는 LCA 분석 서비스 MVP를 개발했습니다. 컨설턴트 인터뷰를 통해 복잡한 LCA 도메인을 실현 가능한 모델로 구체화했으며, 4주의 단기 집중 기간 동안 핵심 비즈니스 로직과 글로벌 대응을 위한 기반 구조를 구축했습니다.",
    skill: [
      {
        name: "Architecture",
      },
      {
        name: "next",
        logo: nextLogo,
      },
      {
        name: "nest",
        logo: nestLogo,
      },
      {
        name: "postgresql",
        logo: postgresqlLogo,
      },
    ],
    duration: "4 Weeks",
    contents: LyncMvpCardContents,
    imageUrl: lyncMvpImage,
  },
  {
    id: 4,
    date: "Aug. 2024 ~ Oct. 2024 & Oct. 2024 ~",
    category: [
      "Architecture",
      "Product Engineering",
      "Lead",
      "Product Managing",
    ],
    title: "LGSP 온실가스 감축 목표관리 DX 솔루션 구현, 관리, 업데이트",
    description:
      "복잡한 엑셀 기반 분석 체계를 디지털 전환(DX)하여 고도화된 대시보드 시스템을 구축했습니다. Pandas의 개념을 차용한 DataFrameTable을 직접 구현해 비정형 엑셀 로직을 구조화된 시스템으로 이식했으며, Service Worker와 IndexedDB를 활용한 데이터 동기화 아키텍처를 설계하여 대규모 시각화 데이터 로딩 성능을 획기적으로 개선했습니다.",
    skill: [
      {
        name: "Architecture",
      },
      {
        name: "vue",
        logo: vueLogo,
      },
      {
        name: "nest",
        logo: nestLogo,
      },
      {
        name: "postgresql",
        logo: postgresqlLogo,
      },
    ],
    duration: "2 Months",
    contents: LgspCardContents,
    imageUrl: lgspImage,
  },
  {
    id: 5,
    date: "All Time",
    category: ["ProdOps"],
    title: "탄중연 ProdOps",
    description:
      "제한된 리소스 속에서 고품질 B2B 제품을 생산하기 위해 '초영역 인재'와 '의미 있는 일'을 핵심 가치로 하는 조직 문화를 구축했습니다. 파편화된 협업 도구를 Notion으로 단일화(SSoT)하고, 3WR·PREP 등 목적 중심의 커뮤니케이션 체계를 도입하여 업무 밀도를 극대화했습니다. 특히 기획과 전략이 부재했던 기존 프로세스의 문제를 진단하고, 제품 발견(Discovery)부터 엄밀한 제품 디자인(Design)에 이르는 전 과정을 구조화하여 실행 가능한 제품화 전략을 수립하는 체계를 완성했습니다.",
    skill: [{ name: "Process" }, { name: "Wow" }, { name: "Communication" }],
    duration: "Infinite",
    contents: ProdOpsCardContents,
    imageUrl: prodOpsImage,
  },
  {
    id: 6,
    date: "All Time",
    category: ["DevOps", "Platform Engineering", "Infrastructure Management"],
    title: "탄중연 Infrastructure & DevOps",
    description:
      "내부 서비스의 정체성 변화에 대응하여 AWS 기반 환경을 On-Premise 베어메탈 환경으로 전환하고, 인프라 전반에 IaC(Terraform/Terramate) 및 독립 IAM(Keycloak) 체계를 구축했습니다. 하드웨어 프로비저닝 자동화(iPXE)부터 선언적 인프라 관리, 표준 보안 프로토콜 도입을 통해 운영 비용을 획기적으로 절감하고 개발자 친화적인 플랫폼 엔지니어링 환경을 완성했습니다.",
    skill: [
      { name: "Terraform", logo: terraformLogo },
      { name: "AWS", logo: awsLogo },
      { name: "Kubernetes", logo: kubernetesLogo },
      { name: "Terramate", logo: terramateLogo },
    ],
    duration: "Infinite",
    contents: InfrastructureCardContents,
    imageUrl: devopsImage,
  },
  {
    id: 7,
    date: "All Time",
    category: ["Architecture", "Technical Governance", "Development Standard"],
    title: "탄중연  Architecture & Technical Governance",
    description:
      "복잡해지는 도메인과 파편화되는 프로젝트 환경에 대응하기 위해, 협업 효율과 유지보수성을 극대화하는 기술 표준 및 아키텍처 가이드라인을 정립했습니다. 프로젝트 특성에 최적화된 아키텍처(Layered/Hexagonal) 채택 기준부터, 데이터 플로우 파악을 용이하게 하는 Vue SoC 전략, 그리고 Atomic Design 기반의 디자인 시스템까지 포함하는 전방위적 개발 표준을 통해 팀의 기술적 일관성과 제품의 품질을 확보했습니다.",
    skill: [{ name: "#" }],
    duration: "Infinite",
    contents: ArchitectureCardContents,
    imageUrl: architectureImage,
  },
  {
    id: 8,
    date: "All Time",
    category: ["Product Engineering"],
    title: "탄중연 공통 Utility",
    description:
      "반복되는 유틸리티 함수와 복잡한 UI 컴포넌트를 표준화하여 팀 내 기술 부채를 줄이고 개발 속도를 개선했습니다. Python 스타일의 내장 객체 확장(Date, Array)부터 비즈니스 핵심 로직(Cursor Pagination, i18n)의 추상화까지, 엄밀한 인터페이스 설계를 통해 누구나 쉽게 고품질의 기능을 구현할 수 있는 환경을 조성했습니다.",
    skill: [
      { name: "javascript", logo: javascriptLogo },
      { name: "typescript", logo: typescriptLogo },
    ],
    duration: "Infinite",
    contents: CommonUtilsCardContents,
    imageUrl: utilsImage,
  },
  {
    id: 9,
    date: "All Time",
    category: ["Lead"],
    title: "탄중연 제품팀 Lead",
    description:
      "인력과 비용의 제약, 급변하는 비즈니스 방향성 속에서도 팀이 높은 퍼포먼스를 유지할 수 있도록 유연한 프로세스 가이드라인과 성장 중심의 인재 관리 체계를 구축했습니다. 프로세스의 '형식'보다 '본질의 체화'를 우선시하여 변화 대응력을 높였으며, 직군을 초월한 지식 공유와 취약성 기반의 신뢰 구축을 통해 지속 가능한 목적 조직의 기틀을 마련했습니다.",
    skill: [{ name: "Leadership" }],
    duration: "Infinite",
    contents: LeadCardContents,
    imageUrl: leadImage,
  },
];

const selectedCardData = ref(null);
const modal = useTemplateRef("modal");

const categories = ["ALL", "Engineering & Planning", "LEAD & ProdOps"];

// --- 2. 반응형 상태(State) 관리 ---
const activeCategory = ref("ALL");
const isDarkMode = ref(false);

// --- 3. 최적화: Computed 속성을 통한 파생 상태 관리 ---
// 의존하는 반응형 데이터(activeCategory)가 변경될 때만 재계산됩니다.
const filteredData = computed(() => {
  if (activeCategory.value === "ALL") {
    return portfolioData;
  }
  return portfolioData.filter((item) =>
    item.category.includes(activeCategory.value),
  );
});

// 테마 토글 함수
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
};

// --- 4. 플로팅 내비게이션 로직 ---
// 홈으로 이동 (최상단 스크롤)
const goHome = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// 페이지 단위 스크롤 (방향: -1 위로, 1 아래로)
const scrollPage = (direction) => {
  // W3C CSSOM View Module 표준에 따른 뷰포트 높이(innerHeight) 계산
  const pageHeight = window.innerHeight;
  window.scrollBy({
    top: direction * pageHeight,
    behavior: "smooth",
  });
};

const onClickCard = (id) => {
  selectedCardData.value = portfolioData.find((data) => data.id === id);

  modal.value.$el.showModal();
};
</script>

<style scoped>
/* --- CSS 변수를 활용한 테마 시스템 (Theming) --- 
  최상위 래퍼(.app-root)에서 Light/Dark 모드의 변수를 통제합니다.
*/
.app-root {
  /* Light Theme Variables */
  --bg-color: #ffffff;
  --text-primary: #000000;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;

  --border-color: #e5e7eb;
  --border-strong: #000000;

  --btn-bg-hover: #f3f4f6;
  --card-hover-bg: #f9fafb;
  --img-bg-color: #f3f4f6;

  --footer-bg: #000000;
  --footer-text: #ffffff;
  --footer-border: #000000;
}

.app-root.dark {
  /* Dark Theme Variables */
  --bg-color: #0a0a0a;
  --text-primary: #ffffff;
  --text-secondary: #9ca3af;
  --text-tertiary: #6b7280;

  --border-color: #27272a;
  --border-strong: #ffffff;

  --btn-bg-hover: #27272a;
  --card-hover-bg: rgba(24, 24, 27, 0.5);
  --img-bg-color: #27272a;

  --footer-bg: #050505;
  --footer-text: #ffffff;
  --footer-border: #27272a;
}

/* --- Base Styles --- */
.app-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
  color: var(--text-primary);
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    sans-serif;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

::selection {
  background-color: var(--border-strong);
  color: var(--bg-color);
}

.max-w-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

@media (min-width: 640px) {
  .max-w-wrapper {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}
@media (min-width: 1024px) {
  .max-w-wrapper {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

/* --- Header --- */
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: right;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-strong);
  transition: border-color 0.3s ease;
}
@media (min-width: 640px) {
  .header {
    flex-direction: row;
  }
}

.logo {
  font-weight: 700;
  letter-spacing: 0.1em;
  font-size: 0.875rem;
  text-transform: uppercase;
  margin-bottom: 1rem;
}
@media (min-width: 640px) {
  .logo {
    margin-bottom: 0;
  }
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-size: 0.875rem;
}

.nav-links {
  display: none;
  gap: 1rem;
}
@media (min-width: 768px) {
  .nav-links {
    display: flex;
  }
}
.nav-links a {
  color: inherit;
  text-decoration: none;
}
.nav-links a:hover {
  text-decoration: underline;
}

.social-icons {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon-btn {
  color: var(--text-secondary);
  transition: color 0.2s ease;
  display: flex;
}
.icon-btn:hover {
  color: var(--text-primary);
}

.theme-toggle {
  margin-left: 0.5rem;
  padding: 0.5rem;
  border-radius: 9999px;
  background-color: var(--img-bg-color);
  border: none;
  color: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}
.theme-toggle:hover {
  background-color: var(--btn-bg-hover);
}

/* --- Hero Section --- */
.hero-section {
  padding: 2rem 0;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid var(--border-color);
  transition: border-color 0.3s ease;
}
@media (min-width: 640px) {
  .hero-section {
    padding: 4rem 0;
  }
}

.hero-title {
  font-size: 12vw;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.05em;
  text-transform: uppercase;
  margin: 0;
}
@media (min-width: 640px) {
  .hero-title {
    font-size: 15vw;
  }
}
@media (min-width: 768px) {
  .hero-title {
    font-size: 12vw;
  }
}
@media (min-width: 1024px) {
  .hero-title {
    font-size: 10vw;
  }
}

/* --- Filters --- */
.filter-section {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem 0;
}
@media (min-width: 640px) {
  .filter-section {
    flex-direction: row;
    align-items: center;
  }
}

.filter-title {
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin: 0 0 1rem 0;
}
@media (min-width: 640px) {
  .filter-title {
    margin-bottom: 0;
  }
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.375rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}
.filter-btn:hover {
  border-color: var(--border-strong);
  color: var(--text-primary);
}
.filter-btn.active {
  border-color: var(--border-strong);
  background-color: var(--border-strong);
  color: var(--bg-color);
}

/* --- Portfolio Grid (Table Layout 구현부) --- */
.portfolio-grid {
  display: grid;
  grid-template-columns: 1fr;
  /* 부모 컨테이너에 위쪽, 왼쪽 테두리 할당 */
  border-top: 1px solid var(--border-color);
  border-left: 1px solid var(--border-color);
  margin-bottom: 5rem;
  transition: border-color 0.3s ease;
}
@media (min-width: 768px) {
  .portfolio-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .portfolio-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* --- Card Item --- */
/* Styles moved to PortfolioCard.vue */

/* --- Footer --- */
.footer {
  margin-top: auto;
  background-color: var(--footer-bg);
  color: var(--footer-text);
  padding: 7rem 2rem;
  text-align: center;
  border-top: 1px solid var(--footer-border);
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}
.footer p {
  margin: 0;
  font-size: 0.875rem;
  letter-spacing: 0.1em;
  color: var(--text-tertiary);
}

/* --- Floating Navigation Elements --- */
.floating-home {
  position: fixed;
  top: 1rem;
  left: 1.5rem;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: var(--bg-color);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}
.app-root.dark .floating-home {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
}
.floating-home:hover {
  border-color: var(--border-strong);
  background-color: var(--btn-bg-hover);
  transform: translateY(-2px);
}

.floating-scroll-nav {
  position: fixed;
  bottom: 4rem;
  right: 2rem;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.scroll-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: var(--bg-color);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}
.app-root.dark .scroll-btn {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
}
.scroll-btn:hover {
  border-color: var(--border-strong);
  background-color: var(--btn-bg-hover);
  transform: translateY(-2px);
}
</style>
