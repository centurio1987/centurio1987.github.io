<template>
  <div class="scroll-animated-section-list">
    <slot></slot>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
@layer component {
  .scroll-animated-section-list {
    scroll-snap-type: y mandatory;
    /* scroll-behavior: smooth; */
    height: 100vh;
    overflow-y: auto;
    scrollbar-width: none;
  }
}
</style>
