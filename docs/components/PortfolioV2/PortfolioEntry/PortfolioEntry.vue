<template>
  <div class="portfolio-entry">
    <PortfolioEntryBg />
    <InitialImg class="initial-img" />
    <PortfolioEntrySlogan class="slogan" />
    <PortfolioEntryScrollGradient />
    <ArrowDownImg class="arrow-down" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import PortfolioEntryBg from "./PortfolioEntryBg.vue";
import InitialImg from "./InitialImg.vue";
import PortfolioEntrySlogan from "./PortfolioEntrySlogan.vue";
import ArrowDownImg from "./ArrowDownImg.vue";
import PortfolioEntryScrollGradient from "./PortfolioEntryScrollGradient.vue";

onMounted(() => {
  document.startViewTransition();
});
</script>

<style scoped>
.portfolio-entry {
  position: relative;
  height: 100vh;

  display: flex;
  align-items: center;
  justify-content: center;

  & > .initial-img {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  & > .slogan {
    position: absolute;
    top: 70%;
    left: 51%;
    transform: translateX(-50%);
  }

  & > .arrow-down {
    position: absolute;
    bottom: 1%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
