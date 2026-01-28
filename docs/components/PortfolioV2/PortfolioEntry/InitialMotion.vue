<template>
  <svg
    width="180"
    height="180"
    viewBox="0 0 180 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      class="giyeok"
      d="M20.0684 19.5L159.068 19.5V160.5"
      stroke="rgb(247,247,247)"
      stroke-width="32"
    />
    <path
      class="ieung"
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M98.7495 19.6836C132.539 19.6838 159.931 47.442 159.931 81.6835C159.931 115.925 132.539 143.683 98.7496 143.684C64.96 143.684 37.5684 115.925 37.5684 81.6837C37.5685 47.442 64.96 19.6836 98.7495 19.6836Z"
      stroke="transparent"
      stroke-width="32"
    />
    <path
      class="digeud"
      d="M157.801 19.6446L20.1855 19.6445L20.1855 143.149L157.805 143.149"
      stroke="transparent"
      stroke-width="32"
    />
  </svg>
</template>

<script setup lang="ts">
import { gsap } from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { onMounted } from "vue";

onMounted(() => {
  gsap.registerPlugin(MorphSVGPlugin);

  gsap
    .timeline({
      defaults: { duration: 2, ease: "expo.inOut" },
      repeat: -1,
      yoyo: true,
    })
    .to(".giyeok", {
      morphSVG: ".ieung",
    })
    .to(".giyeok", {
      morphSVG: ".digeud",
    });
});
</script>

<style scoped></style>
