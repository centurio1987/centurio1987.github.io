<template>
  <div class="portfolio-button-group">
    <slot></slot>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.portfolio-button-group {
  display: flex;
  column-gap: 25px;
  align-items: center;
  height: 100%;
}
</style>
