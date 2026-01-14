<template>
  <div class="track">
    <div class="sticky-view">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
@layer component {
  .track {
    height: 150vh;
    position: relative;
    scroll-snap-align: start;
    scroll-snap-stop: always;

    & > .sticky-view {
      position: sticky;
      top: 0;
      height: 100vh;
      z-index: 0;
    }
  }
}
</style>
