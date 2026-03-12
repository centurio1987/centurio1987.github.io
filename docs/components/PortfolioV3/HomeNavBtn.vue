<template>
  <!-- Floating Home Button -->
  <a href="/">
    <button class="floating-home" aria-label="Go to Home">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    </button>
  </a>
</template>

<script setup lang="ts"></script>

<style scoped>
.floating-home {
  position: fixed;
  top: 2rem;
  left: 2rem;
  z-index: 1000;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition:
    background 0.2s,
    transform 0.2s;
}

.floating-home:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}
</style>
