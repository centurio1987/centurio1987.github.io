<template>
  <svg
    width="240"
    height="320"
    viewBox="0 0 240 320"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- 배경 그리드 (시퀀스 1단계의 느낌을 살림) -->
    <defs>
      <pattern
        id="smallGrid"
        width="20"
        height="20"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M 20 0 L 0 0 0 20"
          fill="none"
          stroke="#f0f0f0"
          stroke-width="0.5"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#smallGrid)" />
    <!-- ㄱ (Giyeok): 볼드하고 각진 형태 -->
    <path
      d="M60 60 H180 V120"
      stroke="black"
      stroke-width="24"
      stroke-linejoin="miter"
      class="draw-path"
      style="--order: 0; --length: 180"
    />
    <!-- ㅇ (Ieung): 정원 형태의 볼드한 원 -->
    <circle
      cx="120"
      cy="170"
      r="45"
      stroke="black"
      stroke-width="24"
      class="draw-path"
      style="--order: 1; --length: 283"
    />
    <!-- ㄷ (Digeut): 각진 U자 형태 -->
    <path
      d="M180 230 H60 V290 H180"
      stroke="black"
      stroke-width="24"
      stroke-linejoin="miter"
      stroke-linecap="square"
      class="draw-path"
      style="--order: 2; --length: 300"
    />
  </svg>
</template>

<script setup lang="ts"></script>

<style scoped>
.draw-path {
  stroke-dasharray: var(--length);
  stroke-dashoffset: var(--length);
  animation: drawLine 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: calc(var(--order) * 0.6s);
}
@keyframes drawLine {
  to {
    stroke-dashoffset: 0;
  }
} /* 최종 완성 후 가벼운 강조 효과 */
svg {
  animation: stabilize 0.5s ease-in-out 2.5s forwards;
}
@keyframes stabilize {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}
</style>
