<template>
  <div class="portfolio-entry-sscroll-gradient"></div>
</template>

<script setup lang="ts"></script>

<style scoped>
.portfolio-entry-sscroll-gradient {
  position: absolute;
  bottom: 0;
  width: 100%;
  /* height: 10%; */

  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 1) 0%,
    rgba(249, 73, 32, 0.25) 100%
  );

  animation: paint 1ms linear;
  animation-timeline: --track;
}

@keyframes paint {
  from {
    height: 0%;
  }
  to {
    height: 10%;
  }
}
</style>
