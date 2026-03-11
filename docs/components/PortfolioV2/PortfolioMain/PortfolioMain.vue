<template>
  <div class="portfolio-main">
    <div class="progress"></div>
    <div class="sub-title">
      <div class="bar"></div>
      <h3>Serious Work, Joyful Wit.</h3>
    </div>
    <div class="title">
      <h1 class="title-header">PROJECT PORTFOLIO</h1>
    </div>

    <p>
      넓으면서 놓은, 영혼이 약간 나갑니다. 정말 성악도 이도 그런 들 아니다. 타다
      욕구에게 몇 보기 이렇다. 모로 37분 기반에 문만 그런 나가 않다 퇴행성에게
      치다 있다. 가끔 전구에서 때문, 부상하는 그는 이용하다 깨끗하여 아랑곳하지
      타다. 선생님이 그런다 주지 거리감부터 나에 머리에 농담하여. 민족은 총은,
      이러하여요 선천성에서 것, 다한다.
    </p>
    <PortfolioButtonGroup class="button-group">
      <PortfolioButton
        :value="category"
        v-for="category in categories"
        @button:click="
          (id) => {
            selectedButtonValue = id;
          }
        "
      />
    </PortfolioButtonGroup>
    <PortfolioCardContainer
      class="card-container"
      v-if="selectedButtonValue === 'cto'"
    >
      <slot name="cto"></slot>
    </PortfolioCardContainer>
    <PortfolioCardContainer
      class="card-container"
      v-else-if="selectedButtonValue === 'po'"
    >
      <slot name="po"></slot>
    </PortfolioCardContainer>
    <PortfolioCardContainer
      class="card-container"
      v-else-if="selectedButtonValue === 'backend'"
    >
      <slot name="backend"></slot>
    </PortfolioCardContainer>
    <PortfolioCardContainer
      class="card-container"
      v-else-if="selectedButtonValue === 'frontend'"
    >
      <slot name="frontend"></slot>
    </PortfolioCardContainer>
  </div>
</template>

<script setup lang="ts">
import PortfolioButtonGroup from "./PortfolioButtonGroup.vue";
import PortfolioButton from "./PortfolioButton.vue";
import PortfolioCardContainer from "../PortfolioCard/PortfolioCardContainer.vue";
import { ref } from "vue";

const categories: {
  id: "cto" | "po" | "backend" | "frontend";
  value: string;
}[] = [
  {
    id: "cto",
    value: "CTO & TEAM LEADER",
  },
  {
    id: "po",
    value: "PRODUCT OWNER",
  },
];

const selectedButtonValue = ref("cto");
</script>

<style scoped>
.portfolio-main {
  padding: 15px;
  background: var(--BG-Normal);
  height: 100%;
  display: grid;
  grid-template:
    "sub-title" 50px
    "title" 180px
    "desc" minmax(100px, 140px)
    "button-group" 90px
    "card-container" 1fr
    / 1fr;
  align-items: start;

  & > .progress {
    position: absolute;
    top: 0;
    left: 0;
    height: 2px;
    background: var(--Primary-Normal);

    animation: progress 1ms reverse linear;
    animation-timeline: --track;
  }

  & > .sub-title {
    display: flex;
    column-gap: 15px;
    grid-area: sub-title;
    align-items: center;

    & > .bar {
      background: var(--Primary-Normal);
      width: 35px;
      height: 2px;
    }

    & > h3 {
      margin: 0;
      font-size: 16pt;
      font-family: "Sora", sans-serif;
      font-optical-sizing: auto;
      font-weight: 600;
      font-style: italic;
    }
  }

  & > .title {
    display: flex;
    align-items: center;

    & > .title-header {
      font-family: "Black Ops One", system-ui;
      font-weight: 400;
      font-size: 55pt;
      font-style: normal;
      line-height: 55pt;

      width: 500px;

      margin: 0;
    }

    & > .gear-img {
      animation: 1ms linear reverse rotate;
      animation-timeline: --track;
    }
    grid-area: title;
  }

  & > p {
    min-width: 450px;
    max-width: 550px;
    grid-area: desc;
    margin: 0;

    font-family: "RoundedFixedsys", sans-serif;
    color: var(--Neutral-70);
  }

  & > .button-group {
    grid-area: button-group;
  }

  & > .card-container {
    grid-area: card-container;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes progress {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}
</style>
