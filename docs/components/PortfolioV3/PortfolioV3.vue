<template>
  <div class="portfolio">
    <PortfolioCover />
    <PortfolioCover2 />
    <PortfolioMain />
  </div>
</template>

<script setup lang="ts">
import PortfolioCover from "./PortfolioCover.vue";
import PortfolioCover2 from "./PortfolioCover2.vue";
import PortfolioMain from "./PortfolioMain.vue";
</script>

<style scoped>
.portfolio {
  max-width: 1920px;
  min-width: 1024px;
  scroll-snap-type: y mandatory;
  height: 100vh;
  overflow-y: scroll;
  scrollbar-width: none;
  scroll-behavior: smooth;
}

:deep(> *) {
  scroll-snap-align: start;
  scroll-snap-stop: always;
  /* scroll-snap-margin: 0 0 50vh 0; */
}
</style>
