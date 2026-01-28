<template>
  <div class="portfolio-card-container">
    <slot></slot>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.portfolio-card-container {
  display: grid;
  margin-top: 25px;

  grid-template-columns: 1fr 1fr;
  grid-auto-rows: 500px;
  gap: 25px;

  row-gap: 60px;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
