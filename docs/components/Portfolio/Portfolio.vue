<template>
  <div id="portfolio-page">
    <PortfolioBg />
    <Logo />
    <FloatingButtonGroup :items="floatingButtonItems" />
    <ScrollAnimatedSectionList>
      <ScrollAnimatedSection v-for="item in floatingButtonItems" :id="item.id">
        <PortfolioCarousel
          :key="item.id"
          :type="item.id"
          :theme="item.theme as 'pink' | 'purple'"
        >
          <slot :name="item.id"></slot>
        </PortfolioCarousel>
      </ScrollAnimatedSection>
    </ScrollAnimatedSectionList>
  </div>
</template>

<script setup lang="ts">
import ScrollAnimatedSectionList from "../ScrollAnimated/ScrollAnimatedSectionList.vue";
import Logo from "../Logo.vue";
import ScrollAnimatedSection from "../ScrollAnimated/ScrollAnimatedSection.vue";
import FloatingButtonGroup from "../FloatingButton/FloatingButtonGroup.vue";
import PortfolioCarousel from "../PortfolioCarousel/PortfolioCarousel.vue";
import PortfolioBg from "./PortfolioBg.vue";

const floatingButtonItems = [
  { id: "cto", name: "cto", theme: "pink" },
  { id: "po", name: "po", theme: "purple" },
  { id: "backend-engineer", name: "backend-engineer", theme: "purple" },
];
</script>

<style scoped>
@keyframes opening {
  0% {
    background: rgba(155, 155, 155, 1);
  }
  100% {
    background: rgba(155, 155, 155, 0);
  }
}
@layer page {
  #portfolio-page {
    min-width: 1440px;
    max-width: 1920px;
    min-height: 100vh;
    animation: opening 0.5ms ease 0 1;
  }

  /* 애니메이션의 핵심 CSS */
  .handwriting-path {
    fill: none; /* 내부는 채우지 않음 */
    stroke: #000000; /* 글씨 색상 (검정) */
    /* stroke-width: 3; 펜 두께 (조절 필요) */
    /* stroke-linecap: round; 선 끝을 둥글게 */
    /* stroke-linejoin: round; 선 꺾임을 둥글게 */

    /* 초기 상태: 선을 숨김 */
    stroke-dasharray: 1000; /* 임의의 큰 값 (JS가 덮어씀) */
    stroke-dashoffset: 1000; /* 임의의 큰 값 (JS가 덮어씀) */

    /* 애니메이션 정의 */
    animation: draw 2s cubic-bezier(0.42, 0, 0.5, 1) forwards;
    /* 4s는 전체 애니메이션 시간. 필요에 따라 조절 */
  }

  /* 각 단어별로 약간의 시차를 두고 싶다면 아래 주석을 해제하고 활용 */

  .path-1 {
    animation-delay: 0s;
  }
  .path-2 {
    animation-delay: 0.3s;
  }
  .path-3 {
    animation-delay: 0.6s;
  }

  .path-4 {
    animation-delay: 3s;
  }

  @keyframes draw {
    to {
      stroke-dashoffset: 0; /* 선이 완전히 드러나도록 오프셋을 0으로 */
    }
  }

  /* 1. 트랙 설정 (스크롤 영역 확보) */
  .track {
    height: 300vh; /* 300vh 동안 애니메이션 진행 */
    view-timeline-name: --my-pinned-section; /* 이 트랙에 이름 부여 */
    view-timeline-axis: block;
  }

  /* 2. 고정 영역 (Sticky) */
  .sticky-view {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #000;
    z-index: 0;
  }

  /* 3. 내부 요소 애니메이션 정의 */
  @keyframes scaleUp {
    from {
      transform: scale(0.5);
      opacity: 0.5;
    }
    to {
      transform: scale(1.5);
      opacity: 1;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* 4. 애니메이션 연결 */
  .visual-element {
    width: 300px;
    height: 300px;
    background: #222;
    border: 1px solid #f94920;
    border-radius: 50%;

    animation: scaleUp linear both;
    /* 부모(.track)의 스크롤 위치를 타임라인으로 사용 */
    animation-timeline: --my-pinned-section;
    /* 트랙이 화면에 들어와서(entry) 나갈때(exit)까지 전체 구간 동안 재생 */
    animation-range: entry 0% exit 100%;
  }

  .text-element {
    margin-top: 2rem;
    color: #fff;
    font-size: 2rem;

    animation: fadeIn linear both;
    animation-timeline: --my-pinned-section;
    /* 트랙의 중간 부분(20%~80%)에서만 애니메이션 실행 */
    animation-range: entry 20% entry 80%;
  }

  .content1 {
    width: 500px;
    height: 300px;
    background: skyblue;
  }

  .content2 {
    width: 500px;
    height: 300px;
    background: rgb(104, 94, 255);
  }
}
</style>
