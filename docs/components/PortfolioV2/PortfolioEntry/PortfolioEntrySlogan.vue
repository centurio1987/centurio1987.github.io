<template>
  <h1 class="portfolio-entry-slogan"></h1>
</template>

<script setup lang="ts">
import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { onMounted } from "vue";

onMounted(() => {
  gsap.registerPlugin(ScrambleTextPlugin);

  gsap.to(".portfolio-entry-slogan", {
    duration: 4.3,
    scrambleText: {
      text: "KIM YOONDEOK, PORTFOLIO",
      chars: "KYD",
      revealDelay: 0.5,
      speed: 0.5,
      newClass: "myClass",
    },
  });
});
</script>

<style scoped>
.portfolio-entry-slogan {
  /* font-family: "DotGothic16"; */
  font-size: 30pt;
}
</style>
