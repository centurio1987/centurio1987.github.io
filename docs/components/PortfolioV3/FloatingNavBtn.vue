<template>
  <!-- Floating Scroll Nav -->
  <div class="floating-scroll-nav">
    <button class="scroll-btn" aria-label="Scroll Up" @click="scrollToPrev">
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
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
    <button class="scroll-btn" aria-label="Scroll Down" @click="scrollToNext">
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
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
function getSnapSections() {
  const container = document.querySelector(".portfolio");
  if (!container) return { container: null, sections: [] };
  const sections = Array.from(container.children).filter(
    (el) => !el.classList.contains("floating-scroll-nav"),
  ) as HTMLElement[];
  return { container: container as HTMLElement, sections };
}

function getCurrentIndex(
  container: HTMLElement,
  sections: HTMLElement[],
): number {
  const scrollTop = container.scrollTop;
  const containerHeight = container.clientHeight;
  const mid = scrollTop + containerHeight / 2;

  let closest = 0;
  let minDist = Infinity;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (!section) continue;
    const dist = Math.abs(section.offsetTop - scrollTop);
    if (dist < minDist) {
      minDist = dist;
      closest = i;
    }
  }
  return closest;
}

function scrollToPrev() {
  const { container, sections } = getSnapSections();
  if (!container || sections.length === 0) return;
  const idx = getCurrentIndex(container, sections);
  const target = Math.max(0, idx - 1);
  const el = sections[target];
  if (el) container.scrollTo({ top: el.offsetTop, behavior: "smooth" });
}

function scrollToNext() {
  const { container, sections } = getSnapSections();
  if (!container || sections.length === 0) return;
  const idx = getCurrentIndex(container, sections);
  const target = Math.min(sections.length - 1, idx + 1);
  const el = sections[target];
  if (el) container.scrollTo({ top: el.offsetTop, behavior: "smooth" });
}
</script>

<style scoped>
.floating-scroll-nav {
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 1000;
}

.scroll-btn {
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

.scroll-btn:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}
</style>
