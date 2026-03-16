<script setup></script>

<template>
  <div class="poster-container">
    <!-- Grain Texture Layer -->
    <div class="grain-overlay"></div>

    <!-- 배경 레이어: clip-path로 사선 분할 -->
    <div class="bg-white"></div>
    <div class="bg-black"></div>

    <main id="poster-main">
      <!-- LEFT SECTION -->
      <section class="left-section">
        <div class="content-wrapper">
          <span class="phase-tag">PHASE 01</span>
          <h1 class="split-title font-display">Lead &<br />Process</h1>
          <p class="description">
            비즈니스 성장을 위한 <br />
            최적화된 프로세스 & 리드.
          </p>
        </div>
      </section>

      <!-- RIGHT SECTION -->
      <section class="right-section">
        <div class="content-wrapper">
          <span class="phase-tag">PHASE 02</span>
          <h1 class="split-title font-display">Planning &<br />Engineering</h1>
          <p class="description">
            전략적 기획 & <br />
            하이 스탠다드 엔지니어링
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;700;900&display=swap");

.poster-container {
  position: relative;
  min-height: 100vh;
  width: 100%;
  font-family: "Inter", sans-serif;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
}

.font-display {
  font-family: "Anton", sans-serif;
}

/* 배경 레이어 */
.bg-white {
  position: absolute;
  inset: 0;
  background-color: #ffffff;
  z-index: 1;
}

.bg-black {
  position: absolute;
  inset: 0;
  background-color: #000000;
  z-index: 2;
  /* 모바일: 가로 사선 분할 (위에서 55% 지점 → 45% 지점으로 사선) */
  clip-path: polygon(0 55%, 100% 45%, 100% 100%, 0 100%);
}

/* Grain Animation */
@keyframes grain {
  0%,
  100% {
    transform: translate(0, 0);
  }
  10% {
    transform: translate(-5%, -10%);
  }
  20% {
    transform: translate(-15%, 5%);
  }
  30% {
    transform: translate(7%, -25%);
  }
  40% {
    transform: translate(-5%, 25%);
  }
  50% {
    transform: translate(-15%, 10%);
  }
  60% {
    transform: translate(15%, 0%);
  }
  70% {
    transform: translate(0%, 15%);
  }
  80% {
    transform: translate(3%, 35%);
  }
  90% {
    transform: translate(-10%, 10%);
  }
}

.grain-overlay {
  position: fixed;
  inset: -200%;
  height: 400%;
  width: 400%;
  pointer-events: none;
  opacity: 0.05;
  z-index: 100;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E");
}

/* Layout */
main {
  position: relative;
  z-index: 10;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem;
}

.content-wrapper {
  position: relative;
}

.phase-tag {
  position: absolute;
  top: -3rem;
  font-weight: 900;
  font-size: 0.875rem;
  opacity: 0.3;
  letter-spacing: 0.5em;
}

.split-title {
  line-height: 1.1;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  margin-bottom: 1rem;
}

.description {
  max-width: 28rem;
  font-size: 1.125rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.8;
}

/* 왼쪽 (흰 배경 위) */
.left-section {
  color: #000000;
}

/* 오른쪽 (검정 배경 위) */
.right-section {
  color: #ffffff;
  text-align: right;
}

.right-section .content-wrapper {
  margin-left: auto;
}
.right-section .description {
  margin-left: auto;
}
.right-section .phase-tag {
  right: 0;
}

/* Desktop: 좌우 분할 */
@media (min-width: 768px) {
  main {
    flex-direction: row;
  }
  section {
    padding: 5rem;
  }
  .bg-black {
    /* 데스크톱: 세로 사선 분할 (위 58% → 아래 42%) */
    clip-path: polygon(58% 0, 100% 0, 100% 100%, 42% 100%);
  }
  .split-title {
    font-size: clamp(3rem, 8vw, 7rem);
  }
}
</style>
