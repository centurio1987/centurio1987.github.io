<template>
  <article class="glassmorphism-bg portfolio-carousel-content">
    <slot></slot>
  </article>
</template>

<script setup lang="ts"></script>

<style scoped>
@layer component {
  .portfolio-carousel-content {
    flex-shrink: 0;
    width: 100%;
  }
}
</style>
