<script setup>
/**
 * B&W Split Poster - Vue 3 Composition API Edition
 * 1. 실무 표준인 <script setup> 문법 사용
 * 2. CSS Variables를 Vue의 v-bind와 결합하여 최적화된 스타일 제어
 * 3. 윈도우 이벤트 리스너의 철저한 생명주기 관리 (Memory Leak 방지)
 */
import { ref, onMounted, onUnmounted } from "vue";

// 상태 정의: 분할 위치를 관리하는 반응형 객체
const splitPos = ref({
  x: 95,
  xAlt: 85,
  y: 95,
  yAlt: 100,
});

/**
 * 마우스 이동 핸들러
 * 뷰포트 대비 마우스 위치를 계산하여 CSS 변수 값을 업데이트합니다.
 */
const handleMouseMove = (e) => {
  const xPercent = (e.clientX / window.innerWidth) * 100;
  const yPercent = (e.clientY / window.innerHeight) * 100;

  if (window.innerWidth >= 768) {
    // 데스크톱: 세로 분할선 이동 로직
    splitPos.value.x = 95 + (xPercent - 50) * 0.1;
    splitPos.value.xAlt = 85 + (xPercent - 50) * 0.1;
    // 모바일 변수 초기화
    splitPos.value.y = 95;
    splitPos.value.yAlt = 100;
  } else {
    // 모바일: 가로 분할선 이동 로직
    splitPos.value.y = 95 + (yPercent - 50) * 0.1;
    splitPos.value.yAlt = 100 + (yPercent - 50) * 0.1;
    // 데스크톱 변수 초기화
    splitPos.value.x = 95;
    splitPos.value.xAlt = 85;
  }
};

/**
 * 화면 리사이즈 시 초기화 핸들러
 */
const handleResize = () => {
  if (window.innerWidth >= 768) {
    splitPos.value.y = 95;
    splitPos.value.yAlt = 100;
  } else {
    splitPos.value.x = 95;
    splitPos.value.xAlt = 85;
  }
};

// 라이프사이클 관리
onMounted(() => {
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <div
    class="poster-container"
    :style="{
      '--split-x': `${splitPos.x}%`,
      '--split-x-alt': `${splitPos.xAlt}%`,
      '--split-y': `${splitPos.y}%`,
      '--split-y-alt': `${splitPos.yAlt}%`,
    }"
  >
    <!-- Grain Texture Layer -->
    <div class="grain-overlay"></div>

    <main id="poster-main">
      <!-- TOP / LEFT SECTION (White Background) -->
      <section class="top-section">
        <div class="content-wrapper">
          <span class="phase-tag">PHASE 01</span>
          <h1 class="split-title font-display">Lead &<br />Process</h1>
          <p class="description">
            비즈니스 성장을 위한 <br />
            최적화된 프로세스 & 리드.
          </p>
          <!-- <a href="#" class="cta-btn">Learn More</a> -->
        </div>
      </section>

      <!-- BOTTOM / RIGHT SECTION (Black Background) -->
      <section class="bottom-section">
        <div class="content-wrapper">
          <span class="phase-tag">PHASE 02</span>
          <h1 class="split-title font-display">Planning &<br />Engineering</h1>
          <p class="description">
            전략적 기획 & <br />
            하이 스탠다드 엔지니어링
          </p>
          <!-- <a href="#" class="cta-btn">View Systems</a> -->
        </div>
      </section>

      <!-- UI Footer -->
      <!-- <footer>
        <div>Standard Practice<br />Est. 2024</div>
        <div class="text-right">Core Systems<br />v2.5.0</div>
      </footer> -->
    </main>
  </div>
</template>

<style scoped>
/* 구글 폰트 로드는 전역 설정으로 권장되나, SFC 내에서 포함 */
@import url("https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;700;900&display=swap");

.poster-container {
  --bg-white: #ffffff;
  --bg-black: #000000;
  min-height: 100vh;
  width: 100%;
  font-family: "Inter", sans-serif;
  background-color: var(--bg-white);
  color: var(--bg-black);
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
}

.font-display {
  font-family: "Anton", sans-serif;
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
  background-image: url("https://upload.wikimedia.org/wikipedia/commons/5/5c/Image_with_unform_noise.png");
  animation: grain 8s steps(10) infinite;
}

/* Layout Structure */
main {
  height: 100vh;
  /* width: 100%; */
  position: relative;
  display: flex;
  flex-direction: column;
}

/* header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 60;
  mix-blend-difference: difference;
  color: white;
} */

.logo {
  font-weight: 900;
  font-size: 1.5rem;
  letter-spacing: -0.05em;
}

nav {
  display: none;
  gap: 2rem;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

nav a {
  color: inherit;
  text-decoration: none;
}
nav a:hover {
  text-decoration: underline;
}

/* Typography & Content */
section {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem;
  transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.content-wrapper {
  max-width: 64rem;
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
  /* font-size: clamp(3rem, 12vw, 10rem); */
  line-height: 1.1;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  margin-bottom: 1rem;
  transition: transform 0.5s ease;
}

.description {
  max-width: 28rem;
  font-size: 1.125rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2rem;
  opacity: 0.8;
}

.cta-btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border: 2px solid currentColor;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

/* Interaction Effects */
.top-section {
  background-color: var(--bg-white);
  color: var(--bg-black);
  z-index: 20;
  clip-path: polygon(0 0, 100% 0, 100% var(--split-y), 0 var(--split-y-alt));
}

.top-section:hover .split-title {
  transform: translateX(1rem);
}
.top-section .cta-btn:hover {
  background-color: var(--bg-black);
  color: var(--bg-white);
}

.bottom-section {
  background-color: var(--bg-black);
  color: var(--bg-white);
  z-index: 10;
  margin-top: -10vh;
  text-align: right;
}

.bottom-section .content-wrapper {
  margin-left: auto;
}
.bottom-section .phase-tag {
  right: 0;
}
.bottom-section:hover .split-title {
  transform: translateX(-1rem);
}
.bottom-section .cta-btn:hover {
  background-color: var(--bg-white);
  color: var(--bg-black);
}

/* Footer UI */
footer {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  right: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  z-index: 60;
  mix-blend-difference: difference;
  color: white;
  pointer-events: none;
  text-transform: uppercase;
  font-size: 0.6rem;
  letter-spacing: 0.3em;
  line-height: 1.5;
}

.text-right {
  text-align: right;
}

/* Desktop Breakpoints */
@media (min-width: 768px) {
  main {
    flex-direction: row;
  }
  nav {
    display: flex;
  }
  section {
    padding: 5rem;
  }
  .top-section {
    clip-path: polygon(0 0, var(--split-x) 0, var(--split-x-alt) 100%, 0 100%);
  }
  .bottom-section {
    margin-top: 0;
    margin-left: -10vw;
  }
  .split-title {
    font-size: clamp(3rem, 10vw, 8rem);
  }
}
</style>
