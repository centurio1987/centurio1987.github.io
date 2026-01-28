<template>
  <svg
    class="initial"
    width="539"
    height="157"
    viewBox="0 0 539 157"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      class="giyeok-logo"
      d="M0 16H139V157"
      stroke="black"
      stroke-width="54"
    />
    <path
      class="ieung-logo"
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M270.181 16C303.97 16.0002 331.362 43.7584 331.362 77.9999C331.362 112.242 303.971 140 270.181 140C236.392 140 209 112.242 209 78.0001C209 43.7584 236.392 16 270.181 16Z"
      stroke="black"
      stroke-width="54"
    />
    <path
      class="digeud-logo"
      d="M538.925 16.4951H401.309V140H538.928"
      stroke="black"
      stroke-width="54"
    />
  </svg>
</template>

<script setup lang="ts">
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

import { onMounted } from "vue";

onMounted(() => {
  gsap.registerPlugin(DrawSVGPlugin);
  gsap.registerPlugin(ScrambleTextPlugin);

  gsap
    .timeline({
      defaults: {
        duration: 0.7,
      },
    })
    .from(".giyeok-logo", {
      drawSVG: "0% 0%",
      x: -600,
      opacity: 0,
    })
    .to(".giyeok-logo", {
      y: -205,
      x: 200,
      ease: "expo",
      duration: 1,
      delay: 0.2,
    })
    .to(".giyeok-logo", {
      rotation: -90,
      duration: 1,
      x: 140,
      y: 35,
      scale: 1.2,
      delay: 0.2,
    });

  gsap
    .timeline({
      defaults: {
        duration: 0.7,
      },
    })
    .from(".digeud-logo", { drawSVG: "0% 0%", x: 600, opacity: 0 })
    .to(".digeud-logo", {
      y: 220,
      x: -180,
      ease: "expo",
      duration: 1,
      delay: 0.2,
    })
    .to(".digeud-logo", {
      rotation: 180,
      duration: 1,
      x: -40,
      y: 320,
      scale: 1.2,
      delay: 0.2,
    });

  gsap.to(".ieung-logo", {
    scale: 1.2,
    delay: 2.1,
    x: 50,
    y: -80,
    rotation: 30,
    drawSVG: "3% 100%",
    duration: 1,
  });

  gsap.to(".entry-desc", {
    duration: 5,
    scrambleText: {
      text: "Kim Yoondeok, Portfolio",
      chars: "KYD",
      revealDelay: 0.5,
      speed: 0.5,
      newClass: "myClass",
    },
  });
});
</script>

<style scoped>
.initial {
  overflow: visible;
}
.entry-desc {
  position: relative;
  left: 0;
  top: 200px;

  font-size: 40pt;
  /* transform: translate(20px, 400px); */
}
</style>
