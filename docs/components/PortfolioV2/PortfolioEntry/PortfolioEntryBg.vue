<template>
  <div class="portfolio-entry-bg">
    <InitialMotion v-for="_ in Array.from({ length: 9 }, (v, k) => k)" />
  </div>
</template>

<script setup lang="ts">
import InitialMotion from "./InitialMotion.vue";
</script>

<style scoped>
.portfolio-entry-bg {
  background: white;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  display: grid;
  grid-template-rows: repeat(3, 1fr);
  grid-template-columns: repeat(3, 1fr);

  align-items: center;
  justify-items: center;
}
</style>
