<template>
  <div
    :class="['portfolio-carousel', props?.theme ? `theme-${props.theme}` : '']"
  >
    <slot></slot>
    <PortfolioCarouselControl @control:active="handleControl" />
  </div>
</template>

<script setup lang="ts">
import PortfolioCarouselControl from "./PortfolioCarouselControl.vue";

type Props = {
  theme?: "pink" | "purple";
};

const props = defineProps<Props>();

const handleControl = (direction: "prev" | "next") => {
  const carousel = document.querySelector(".portfolio-carousel");

  if (!carousel) return;

  const directionFlag = direction === "prev" ? -1 : 1;

  if (direction === "prev" && carousel.scrollLeft === 0) {
    carousel.scrollTo({
      left: carousel.scrollWidth - carousel.clientWidth,
      behavior: "smooth",
    });
  } else if (
    direction === "next" &&
    carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth
  ) {
    console.log("hello");
    carousel.scrollTo({ left: 0, behavior: "smooth" });
  } else {
    carousel.scrollBy({
      left: carousel.clientWidth * directionFlag,
      behavior: "smooth",
    });
  }
};
</script>

<style>
@layer component {
  .portfolio-carousel {
    height: 100vh;
    min-width: 1440px;
    max-width: 1920px;
    display: flex;
    /* gap: 150px; */
    /* padding: 150px 0; */

    overflow-x: auto;
    scrollbar-width: none;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
  }

  .theme-pink {
    & > article {
      background: rgba(254, 211, 247, 0.25);
    }
  }
  .theme-purple {
    & > article {
      background: rgba(242, 214, 255, 0.25);
    }
  }
}
</style>
