<template>
  <input type="button" value="heelo" />
</template>

<script setup lang="ts"></script>

<style scoped>
input[type="button"] {
  /* --- 핵심 속성 --- */
  max-width: 300px;
  min-width: 120px;
  padding: 20px;
  position: fixed;
  top: 130px;
  left: 70px;
  /* (1) 배경 흐림 */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px); /* Safari 호환성 */

  /* (2) 요소 투명도 */
  background-color: rgba(255, 255, 255, 0.15);

  /* (3) 옅은 테두리 */
  border: 1px solid rgba(255, 255, 255, 0.2);

  /* --- 부가 스타일 --- */

  /* (4) 그림자 */
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);

  /* 둥근 모서리 */
  border-radius: 16px;

  /* 내부 여백 및 텍스트 색상 */
  padding: 25px;
  color: #333; /* 텍스트가 잘 보이도록 */
}
</style>
