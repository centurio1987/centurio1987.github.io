---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "빵관 토니"
  text: "Serious Work, Joyful Wit."
  tagline: 기본은 강한 물살에서 나를 지켜주는 무게추가 된다.
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

<div id="background"></div>
<video autoplay loop muted playsinline id="background-video">
  <source src="./assets/videos/vlog.webm" type="video/webm">
</video>
