<template>
  <dialog ref="dialogEl" class="detail-view" @close="onDialogClose">
    <!-- Sticky Navigation Bar -->
    <nav class="detail-nav">
      <div class="nav-content">
        <button @click="closeDialog" class="btn-back">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span>Portfolio</span>
        </button>
        <span class="nav-title">{{ title }}</span>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="detail-main">
      <!-- Article Header -->
      <header class="detail-header">
        <div class="header-meta">
          <span v-for="cat in category" :key="cat" class="meta-tag">{{
            cat
          }}</span>
        </div>
        <h1 class="detail-title">{{ title }}</h1>
        <p class="detail-lead">{{ description }}</p>
        <div class="header-info">
          <div class="info-item" v-if="date">
            <span class="info-label">Period</span>
            <span class="info-value">{{ date }}</span>
          </div>
          <div class="info-item" v-if="skill && skill.length">
            <span class="info-label">Stack</span>
            <div class="info-skills">
              <span v-for="s in skill" :key="s.name" class="skill-chip">
                <img
                  v-if="s.logo"
                  :src="s.logo"
                  :alt="s.name"
                  class="skill-icon"
                />
                {{ s.name }}
              </span>
            </div>
          </div>
        </div>
      </header>

      <!-- Divider -->
      <hr class="section-divider" />

      <!-- Article Body -->
      <article class="detail-body">
        <slot></slot>
      </article>
    </main>

    <!-- Footer -->
    <footer class="detail-footer">
      <button @click="closeDialog" class="btn-footer-back">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to Portfolio
      </button>
    </footer>
  </dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import type { PropType } from "vue";

defineProps({
  date: {
    type: String,
  },
  category: {
    type: Array as PropType<string[]>,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  skill: {
    type: Array as PropType<Array<{ name: string; logo?: string }>>,
  },
});

const dialogEl = ref<HTMLDialogElement | null>(null);
// popstate에 의해 닫히는 경우를 추적
let closedByPopstate = false;
// dialog가 열려 있는 동안 히스토리 상태를 추적
let hasHistoryEntry = false;

/**
 * History API 연동:
 * dialog를 열 때 pushState로 히스토리 엔트리를 추가하고,
 * 브라우저 뒤로가기(popstate)를 감지하면 dialog를 닫는다.
 * 이렇게 하면 뒤로가기 시 포트폴리오 목록이 아닌 이전 페이지로 가는 문제를 방지하고,
 * 동시에 목록 페이지의 스크롤 위치도 보존된다.
 */
const onPopState = () => {
  if (dialogEl.value?.open) {
    closedByPopstate = true;
    hasHistoryEntry = false;
    dialogEl.value.close();
  }
};

onMounted(() => {
  window.addEventListener("popstate", onPopState);
});

onBeforeUnmount(() => {
  window.removeEventListener("popstate", onPopState);
});

const openDialog = () => {
  if (!dialogEl.value) return;
  // 히스토리에 상태를 푸시하여 뒤로가기로 dialog를 닫을 수 있게 함
  history.pushState({ portfolioDetail: true }, "");
  hasHistoryEntry = true;
  closedByPopstate = false;
  dialogEl.value.showModal();
  dialogEl.value.scrollTop = 0;
};

const closeDialog = () => {
  if (!dialogEl.value?.open) return;
  dialogEl.value.close();
};

const onDialogClose = () => {
  // popstate에 의해 닫힌 경우: 이미 히스토리가 뒤로 간 상태이므로 아무 작업 불필요
  if (closedByPopstate) {
    closedByPopstate = false;
    return;
  }
  // 버튼 클릭이나 ESC에 의해 닫힌 경우: pushState로 추가한 엔트리를 제거
  if (hasHistoryEntry) {
    hasHistoryEntry = false;
    history.back();
  }
};

defineExpose({
  openDialog,
  closeDialog,
  $el: dialogEl,
});
</script>

<style scoped>
/* ==========================================================================
   Dialog Base
   ========================================================================== */
.detail-view {
  border: none;
  padding: 0;
  margin: 0;
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  height: 100%;
  background: #ffffff;
  color: #1a1a1a;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
}

.detail-view::backdrop {
  background: rgba(0, 0, 0, 0.3);
}

/* Smooth scrollbar hide */
.detail-view::-webkit-scrollbar {
  width: 0;
}
.detail-view {
  scrollbar-width: none;
}

/* ==========================================================================
   Navigation
   ========================================================================== */
.detail-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid #f0f0f0;
}

.nav-content {
  max-width: 720px;
  margin: 0 auto;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  gap: 1rem;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #1a1a1a;
  padding: 6px 10px 6px 6px;
  border-radius: 6px;
  transition: background-color 0.15s ease;
  flex-shrink: 0;
}
.btn-back:hover {
  background-color: #f5f5f5;
}

.nav-title {
  font-size: 0.75rem;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

/* ==========================================================================
   Main Content Area — narrow, text-optimized
   ========================================================================== */
.detail-main {
  max-width: 720px;
  margin: 0 auto;
  padding: 3rem 1.5rem 4rem;
}

@media (min-width: 768px) {
  .detail-main {
    padding: 4rem 2rem 5rem;
  }
}

/* ==========================================================================
   Header
   ========================================================================== */
.detail-header {
  margin-bottom: 0;
}

.header-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 1.25rem;
}

.meta-tag {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 4px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 3px;
  color: #666;
}

.detail-title {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.03em;
  color: #111;
  margin: 0 0 1.25rem 0;
}

@media (min-width: 768px) {
  .detail-title {
    font-size: 2.5rem;
  }
}

.detail-lead {
  font-size: 1rem;
  line-height: 1.75;
  color: #444;
  margin: 0 0 2rem 0;
  word-break: keep-all;
}

@media (min-width: 768px) {
  .detail-lead {
    font-size: 1.0625rem;
    line-height: 1.8;
  }
}

/* Header Info Grid */
.header-info {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #999;
}

.info-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
}

.info-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.skill-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #444;
}

.skill-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

/* ==========================================================================
   Divider
   ========================================================================== */
.section-divider {
  border: none;
  border-top: 1px solid #e8e8e8;
  margin: 2.5rem 0;
}

/* ==========================================================================
   Article Body — override children for clean typography
   ========================================================================== */
.detail-body {
  font-size: 1rem;
  line-height: 1.8;
  color: #333;
  word-break: keep-all;
}

/* Content card children styles */
.detail-body :deep(.portfolio-wrapper) {
  min-height: auto;
  background: transparent;
  color: inherit;
}

.detail-body :deep(.global-header) {
  display: none;
}

.detail-body :deep(.global-footer) {
  display: none;
}

.detail-body :deep(.portfolio-container) {
  max-width: 100%;
  padding: 0;
}

.detail-body :deep(.section-block) {
  padding-bottom: 2.5rem;
}

.detail-body :deep(.section-title) {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 1.5rem;
  color: #111;
  padding-top: 0;
}

@media (min-width: 768px) {
  .detail-body :deep(.section-title) {
    font-size: 1.75rem;
  }
}

.detail-body :deep(.sub-title) {
  font-size: 1.125rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 0.75rem;
}

.detail-body :deep(.text-lead) {
  font-size: 1rem;
  line-height: 1.75;
  font-weight: 500;
  color: #333;
}

.detail-body :deep(.text-body) {
  font-size: 0.9375rem;
  line-height: 1.8;
  color: #555;
}

@media (min-width: 768px) {
  .detail-body :deep(.text-body) {
    font-size: 1rem;
  }
}

.detail-body :deep(.highlight-text) {
  font-style: italic;
  color: #333;
  border-left: 3px solid #d32f2f;
  padding-left: 1rem;
  margin: 1.25rem 0;
  font-size: 0.9375rem;
  line-height: 1.75;
}

.detail-body :deep(.clean-card) {
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 1.25rem;
  background: #fafafa;
  transition: none;
}
.detail-body :deep(.clean-card:hover) {
  transform: none;
  box-shadow: none;
}

.detail-body :deep(.card-title) {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 0.5rem;
}

.detail-body :deep(.accent-line) {
  height: 2px;
  background-color: #d32f2f;
  margin-bottom: 1.5rem;
  opacity: 0.6;
}

.detail-body :deep(.image-placeholder) {
  padding: 2rem 1rem;
  border-radius: 6px;
  margin: 1.5rem 0;
}

.detail-body :deep(.image-placeholder img) {
  max-width: 100%;
  height: auto;
}

.detail-body :deep(.border-top-thin) {
  border-top: 1px solid #eee;
}

.detail-body :deep(.pt-xlarge) {
  padding-top: 2.5rem;
}

.detail-body :deep(.space-y-xlarge > * + *) {
  margin-top: 2.5rem;
}

.detail-body :deep(.impl-item) {
  padding: 1rem 0;
}

.detail-body :deep(.inline-tag) {
  font-size: 0.6875rem !important;
  padding: 2px 8px !important;
  background-color: #f0f0f0 !important;
  border: 1px solid #e0e0e0 !important;
  border-radius: 3px !important;
  color: #555 !important;
}

.detail-body :deep(.disclaimer-banner) {
  margin: 0 0 2rem 0;
  padding: 0.75rem 1rem;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  font-size: 0.8125rem;
  color: #777;
  font-style: italic;
}

/* Tech stack compact */
.detail-body :deep(.tech-stack-grid) {
  gap: 1rem;
}
.detail-body :deep(.tech-stack-card) {
  padding: 0;
}
.detail-body :deep(.tech-stack-heading) {
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}
.detail-body :deep(.tech-stack-list li) {
  font-size: 0.8125rem;
}

.detail-body :deep(.cards-grid) {
  gap: 1rem;
}

/* ==========================================================================
   Footer
   ========================================================================== */
.detail-footer {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
  border-top: 1px solid #f0f0f0;
}

.btn-footer-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #555;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: all 0.15s ease;
}
.btn-footer-back:hover {
  border-color: #999;
  color: #222;
  background-color: #fafafa;
}
</style>
