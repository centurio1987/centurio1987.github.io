<template>
  <dialog class="detail-view">
    <nav class="detail-nav">
      <div class="nav-content">
        <button @click="onClickBack" class="btn-back">
          <span class="icon">←</span> 나가기
        </button>
        <div class="nav-meta">
          <span>{{ category?.join(", ") }}</span>
          <span class="dot"></span>
          <span>{{ date }}</span>
        </div>
      </div>
    </nav>

    <main class="detail-main">
      <header class="detail-header">
        <div class="detail-categories">
          <span v-for="cat in category" :key="cat" class="detail-category">{{
            cat
          }}</span>
        </div>
        <h1 class="detail-title">{{ title }}</h1>

        <div class="detail-meta-grid">
          <div class="meta-column">
            <span class="meta-label">Skill</span>
            <div class="meta-skills">
              <div v-for="s in skill" :key="s.name" class="meta-skill">
                <img
                  v-if="s.logo"
                  :src="s.logo"
                  :alt="s.name"
                  class="meta-skill-logo"
                  :title="s.name"
                />
                <span class="meta-value">{{ s.name }}</span>
              </div>
            </div>
          </div>
          <div class="meta-column">
            <span class="meta-label">Date</span>
            <span class="meta-value">{{ date }}</span>
          </div>
          <div class="meta-column">
            <span class="meta-label">Reading Time</span>
            <span class="meta-value">{{ duration }}</span>
          </div>
        </div>
      </header>

      <div class="main-visual">
        <img :src="imageUrl" :alt="title" />
      </div>

      <div class="content-layout">
        <article class="content-body">
          <p class="lead-text">{{ description }}</p>
          <slot></slot>
        </article>

        <!-- <aside class="content-sidebar">
          <div class="sidebar-box">
            <h4 class="sidebar-title">Project Info</h4>
            <div class="info-row">
              <span class="info-label">Client</span>
              <span>Art Gallery Seoul</span>
            </div>
            <div class="info-row">
              <span class="info-label">Role</span>
              <span>Lead Curator</span>
            </div>
          </div>
        </aside> -->
      </div>
    </main>

    <footer class="detail-footer">
      <button @click="handleBack" class="btn-footer-back">
        Back to Portfolio
      </button>
    </footer>
  </dialog>
</template>

<script setup lang="ts">
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
  duration: {
    type: String,
  },
});

const emit = defineEmits(["back"]);

const handleBack = () => {
  emit("back");
};

const onClickBack = () => {
  const modal: HTMLDialogElement | null =
    document.querySelector(".detail-view");

  modal?.close();
};
</script>

<style scoped>
/* Detail View Styles */
.detail-view {
  &[open] {
    background: white;
    color: #333;
    min-height: 100vh;
    width: 100%;
    .detail-nav {
      position: sticky;
      top: 0;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid #f0f0f0;
      z-index: 100;
    }
    border: none;

    .nav-content {
      max-width: 1200px;
      margin: 0 auto;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
    }

    .btn-back {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav-meta {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #888888;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .dot {
      width: 4px;
      height: 4px;
      background: #ccc;
      border-radius: 50%;
    }

    .detail-main {
      max-width: 1000px;
      margin: 0 auto;
      padding: 60px 24px;
    }

    .detail-categories {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 24px;
    }

    .detail-category {
      display: inline-block;
      border: 1px solid black;
      padding: 4px 12px;
      font-size: 10px;
      font-weight: 900;
    }

    .meta-skills {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .meta-skill {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .meta-skill-logo {
      width: 20px;
      height: 20px;
      object-fit: contain;
      opacity: 0.8;
      transition: opacity 0.2s ease;
    }

    .meta-skill-logo:hover {
      opacity: 1;
    }

    .detail-title {
      font-size: clamp(40px, 8vw, 72px);
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -0.04em;
      margin-bottom: 40px;
    }

    .detail-meta-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 40px;
      padding-top: 32px;
      border-top: 1px solid #f0f0f0;
      margin-bottom: 60px;
    }

    .meta-column {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .meta-label {
      font-size: 10px;
      text-transform: uppercase;
      color: #888888;
      letter-spacing: 0.1em;
    }

    .meta-value {
      font-size: 14px;
      font-weight: 600;
    }

    .main-visual {
      margin-bottom: 60px;
      border: 1px solid #f0f0f0;
    }

    .main-visual img {
      width: 60%;
      margin: 0 auto;
      display: block;
    }

    .content-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 60px;
    }

    /* @media (min-width: 768px) {
      .content-layout {
        grid-template-columns: 2fr 1fr;
      }
    } */

    .content-body {
      font-size: 18px;
      line-height: 1.7;
      color: #333;
    }

    .lead-text {
      font-weight: 600;
      color: black;
      margin-bottom: 32px;
    }

    .content-placeholder {
      height: 300px;
      background: #f9f9f9;
      border: 1px dashed #ddd;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 40px 0;
      font-size: 12px;
      color: #999;
    }

    .sidebar-box {
      border: 1px solid #f0f0f0;
      padding: 32px;
    }

    .sidebar-title {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 900;
      border-bottom: 1px solid black;
      display: inline-block;
      margin-bottom: 24px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      padding-bottom: 12px;
      margin-bottom: 12px;
      border-bottom: 1px solid #f5f5f5;
    }

    .info-label {
      color: #888888;
    }

    .detail-footer {
      border-top: 1px solid #f0f0f0;
      padding: 60px 24px;
      text-align: center;
    }

    .btn-footer-back {
      background: none;
      border: none;
      text-transform: uppercase;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 0.2em;
      cursor: pointer;
    }

    .btn-footer-back:hover {
      text-decoration: underline;
    }

    .btn-icon {
      padding: 8px 16px;
      border: 1px solid #eee;
      background: white;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
    }
  }
}
</style>
