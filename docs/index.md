---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "김윤덕"
  text: "소프트웨어 창작자"
  tagline: My great project tagline
  actions:
    - theme: brand
      text: Markdown Examples
      link: /markdown-examples
    - theme: alt
      text: API Examples
      link: /api-examples

features:
  - title: 사명
    details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
  - title: 비전
    details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
  - title: 가치
    details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
---

<script setup>
import Button from './components/Button.vue';
</script>
<style>
#background-video {
  position: fixed;
  top:0;
  left: 0;
  width: 100vw;
  height: 100vh;

  object-fit: cover;

  z-index: -1;
}

#background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.6);
  z-index:0;
}

</style>

<Button></Button>

<div id="background"></div>
<video autoplay loop muted playsinline id="background-video">
  <source src="./assets/videos/sample.mp4" type="video/mp4">
</video>
