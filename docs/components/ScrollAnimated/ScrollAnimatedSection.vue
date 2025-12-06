<template>
  <div class="track">
    <div class="sticky-view">
      <article class="content vp-doc">
        <slot></slot>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
@layer component {
  .track {
    height: 300vh;

    & .sticky-view {
      position: sticky;
      top: 0;
      height: 100vh;
      display: flex;
      flex-flow: column;
      align-items: center;
      justify-content: start;
    }
  }
}
</style>
