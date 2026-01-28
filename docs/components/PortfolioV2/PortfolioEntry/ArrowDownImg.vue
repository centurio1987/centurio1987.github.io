<template>
  <svg
    class="arrow-down"
    width="200"
    height="200"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M99.9999 100L174.732 60.4361L166.934 45.7061L99.9999 81.142L33.0657 45.7061L25.2676 60.4361L99.9999 100Z"
      fill="#DCDCDC"
    />
    <path
      d="M99.9999 154.294L174.732 114.73L166.934 100L99.9999 135.436L33.0657 100L25.2676 114.73L99.9999 154.294Z"
      fill="#DCDCDC"
    />
  </svg>
</template>

<script setup lang="ts">
import { gsap } from "gsap";
import { onMounted } from "vue";

onMounted(() => {
  gsap
    .timeline()
    .to(".arrow-down", {
      delay: 3.1,
      opacity: 0.3,
    })
    .to(".arrow-down", {
      duration: 1,
      y: 1,
      ease: "circ.in",
      opacity: 1,
      repeat: -1,
      scale: 1.1,
      yoyo: true,
    });
  // gsap.to(".arrow-down", {
  //   duration: 1,
  //   y: 1,
  //   ease: "circ.in",
  //   opacity: 1,
  //   repeat: -1,
  //   scale: 1.1,
  //   yoyo: true,
  //   delay: 1,
  // });
});
</script>

<style scoped>
.arrow-down {
  opacity: 0;
}
</style>
