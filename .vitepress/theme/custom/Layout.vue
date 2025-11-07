<template>
  <video autoplay playsinline muted loop id="background-video">
    <source src="/docs/assets/videos/sample.mp4"></source>
  </video>
  <template v-if="page.isNotFound">
    <NotFound />
  </template>
  <Content v-else />
</template>

<script setup lang="ts">
import { useData } from "vitepress";
import NotFound from "vitepress/theme";
const { page } = useData();
</script>

<style scoped>
#background-video {
  position: fixed;
  top: 0;
  left: 0;
  width: 100wh;
  height: 100vh;

  
}
</style>
