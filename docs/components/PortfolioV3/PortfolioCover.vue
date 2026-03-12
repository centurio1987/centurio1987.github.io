<template>
  <!-- 루트 컨테이너에 ref를 선언하여 DOM에 직접 접근 -->
  <div class="portfolio-container" ref="containerRef">
    <!-- 노이즈 질감 오버레이 -->
    <div class="grain-overlay"></div>

    <!-- 배경 레이어 (분할) -->
    <div class="bg-layer-black"></div>
    <div class="bg-layer-white"></div>

    <!-- 텍스트/정보 영역 (Mix Blend Mode 적용 영역 밖의 독립적 텍스트) -->
    <div class="info top-left">
      <p>Software Engineer</p>
      <!-- <p class="sub-text">Product Engineer & Product Owner</p> -->
    </div>

    <div class="info top-right text-right">
      <p>Available for work</p>
      <!-- <p class="sub-text"></p> -->
    </div>

    <div class="info bottom-left detail-text">
      <p>Serious Work, Joyful Wit.</p>
    </div>

    <div class="info bottom-right font-poster memento-text">
      野火燒不盡<br />春風吹又生
    </div>

    <!-- 메인 타이포그래피 (화면 중앙) -->
    <div class="typography-wrapper">
      <h1 class="main-title font-poster">
        <span class="hover-distort">Kim</span>
        <span class="hover-distort indent-1">Yoondeok</span>
        <span class="hover-distort indent-2">PORTFOLIO</span>
      </h1>
    </div>

    <!-- 인터랙션 감지를 위한 투명 영역 -->
    <div
      class="interactive-area"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    ></div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from "vue";

// DOM 요소 참조
const containerRef = ref(null);

// 애니메이션 상태 관리 (반응형 상태(ref)로 관리하지 않음으로써 성능 최적화)
let animationFrameId = null;
let currentSplit = 50;
let targetSplit = 50;
let isAnimating = false;

/**
 * 선형 보간(Lerp) 기반의 부드러운 애니메이션 루프
 * Vue의 렌더링 사이클과 독립적으로 동작하여 60fps를 보장합니다.
 */
const animateSplit = () => {
  // 보간 공식: 현재값 += (목표값 - 현재값) * 속도
  currentSplit += (targetSplit - currentSplit) * 0.1;

  if (containerRef.value) {
    // 반응형 변수 바인딩 대신 DOM Style 속성에 직접 CSS 변수 주입
    containerRef.value.style.setProperty("--split-pos", `${currentSplit}%`);
  }

  // 목표치에 도달하지 않았다면 다음 프레임 요청
  if (Math.abs(targetSplit - currentSplit) > 0.1) {
    animationFrameId = requestAnimationFrame(animateSplit);
  } else {
    // 목표치 도달 시 애니메이션 정지 및 값 고정
    currentSplit = targetSplit;
    if (containerRef.value) {
      containerRef.value.style.setProperty("--split-pos", `${currentSplit}%`);
    }
    isAnimating = false;
  }
};

/**
 * 마우스 이동 핸들러
 * @param {MouseEvent} e
 */
const handleMouseMove = (e) => {
  // Y 좌표를 퍼센트로 변환 (화면의 20% ~ 80% 구간만 움직이도록 제한)
  const percent = (e.clientY / window.innerHeight) * 100;
  targetSplit = Math.max(40, Math.min(60, percent));

  if (!isAnimating) {
    isAnimating = true;
    animationFrameId = requestAnimationFrame(animateSplit);
  }
};

/**
 * 마우스 이탈 핸들러 (화면 중앙으로 원복)
 */
const handleMouseLeave = () => {
  targetSplit = 50;
  if (!isAnimating) {
    isAnimating = true;
    animationFrameId = requestAnimationFrame(animateSplit);
  }
};

// 컴포넌트 언마운트 시 메모리 누수 방지를 위한 rAF 정리
onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<style scoped>
/* 구글 폰트 임포트 */
@import url("https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;700&display=swap");

/* 컴포넌트 루트 CSS 변수 및 초기화 */
.portfolio-container {
  --split-pos: 50%;
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #000;
  color: #fff;
  font-family: "Inter", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 텍스트 선택 색상 반전 (사용자 경험 디테일) */
::selection {
  background-color: #fff;
  color: #000;
}

/* 최적화: SVG 노이즈 필터 */
.grain-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E");
}

/* 폰트 유틸리티 */
.font-poster {
  font-family: "Anton", sans-serif;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  line-height: 0.85;
}

/* 배경 레이어 */
.bg-layer-black {
  position: absolute;
  inset: 0;
  background-color: #111;
  z-index: 1;
}

.bg-layer-white {
  position: absolute;
  inset: 0;
  background-color: #f4f4f4;
  z-index: 2;
  /* clip-path를 활용한 영역 분할 (GPU 가속 유도) */
  clip-path: polygon(
    0 var(--split-pos),
    100% var(--split-pos),
    100% 100%,
    0 100%
  );
  transition: clip-path 0.1s ease-out;
}

/* 공통 정보 텍스트 스타일 */
.info {
  position: absolute;
  z-index: 20;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: bold;
  mix-blend-mode: difference;
  pointer-events: none;
}

.sub-text {
  margin-top: 0.25rem;
  opacity: 0.7;
}

.text-right {
  text-align: right;
}

/* 정보 텍스트 위치 (반응형 적용) */
.top-left {
  top: 1.5rem;
  left: 1.5rem;
}
.top-right {
  top: 1.5rem;
  right: 1.5rem;
}
.bottom-left {
  bottom: 1.5rem;
  left: 1.5rem;
}
.bottom-right {
  bottom: 1.5rem;
  right: 1.5rem;
}

@media (min-width: 768px) {
  .info {
    font-size: 0.875rem;
  }
  .top-left {
    top: 2.5rem;
    left: 2.5rem;
  }
  .top-right {
    top: 2.5rem;
    right: 2.5rem;
  }
  .bottom-left {
    bottom: 2.5rem;
    left: 2.5rem;
  }
  .bottom-right {
    bottom: 2.5rem;
    right: 2.5rem;
  }
}

/* 하단 세부 텍스트 */
.detail-text {
  max-width: 200px;
  font-size: 10px;
  letter-spacing: normal;
  text-transform: none;
  font-weight: 400;
  line-height: 1.6;
}

@media (min-width: 768px) {
  .detail-text {
    max-width: 320px;
    font-size: 0.75rem;
  }
}

/* 하단 우측 포스터 텍스트 */
.memento-text {
  font-size: 1.5rem;
  line-height: 1.6;
  /* letter-spacing: -0.02em; */
}

@media (min-width: 768px) {
  .memento-text {
    font-size: 1.875rem;
  }
}

/* 중앙 메인 타이포그래피 래퍼 */
.typography-wrapper {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  pointer-events: none;
  mix-blend-mode: difference;
  color: white;
}

.main-title {
  font-size: 20rem;
  display: flex;
  flex-direction: column;
  /* align-items: center; */
  margin: 0;
}

@media (min-width: 768px) {
  .main-title {
    font-size: 15rem;
  }
}

.indent-1 {
  margin-left: 5vw;
}

.indent-2 {
  margin-left: 10vw;
}

/* 호버 시 텍스트 왜곡 효과 */
.hover-distort {
  display: inline-block;
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.interactive-area:hover ~ .typography-wrapper .hover-distort {
  transform: scaleY(1.1) skewX(-5deg);
}

/* 마우스 이벤트를 받을 투명 레이어 */
.interactive-area {
  position: absolute;
  inset: 0;
  z-index: 30;
}
</style>
