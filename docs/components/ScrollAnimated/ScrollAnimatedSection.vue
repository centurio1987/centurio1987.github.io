<template>
  <div class="scroller">
    <div class="track">
      <div class="sticky-view">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
@layer component {
  .scroller {
    height: 100vh;
    overflow-y: auto;

    scrollbar-width: none;

    scroll-timeline-name: --track;
    scroll-timeline-axis: y;

    scroll-snap-align: start;
    scroll-snap-stop: always;

    & > .track {
      height: 130vh;
      position: relative;

      & > .sticky-view {
        position: sticky;
        top: 0;
        height: 100vh;
        z-index: 0;
      }
    }
  }
}
</style>
