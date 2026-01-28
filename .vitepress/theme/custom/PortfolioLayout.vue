<template>
  <div class="vp-doc">
    <Content />
  </div>
</template>

<script setup lang="ts">
import { useData } from "vitepress";

const { page } = useData();
</script>

<style>
@media (max-width: 960px) {
  .VPLocalNav {
    display: none !important;
  }
}
</style>
