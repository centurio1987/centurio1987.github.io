<template>
  <div class="app-container">
    <!-- List View -->
    <div v-if="view === 'list'" class="list-view">
      <header class="list-header">
        <h1 class="main-title">PORTFOLIO</h1>
      </header>

      <section class="controls">
        <div class="category-filter">
          <span class="label">CATEGORIES</span>
          <div class="filter-buttons">
            <button class="btn-filter active">ALL</button>
            <button class="btn-filter">Engineering & Planning</button>
            <button class="btn-filter">LEAD & ProdOps</button>
          </div>
        </div>
      </section>

      <div class="portfolio-grid">
        <div
          v-for="item in portfolioItems"
          :key="item.id"
          class="portfolio-card"
          @click="handleItemClick(item)"
        >
          <div class="card-meta">
            <span class="date">{{ item.date }}</span>
            <span class="category-tag">{{ item.category }}</span>
          </div>

          <div class="card-image-wrapper">
            <img :src="item.image" :alt="item.title" class="card-image" />
          </div>

          <h2 class="card-title">{{ item.title }}</h2>
          <p class="card-desc">{{ item.description }}</p>

          <div class="card-footer">
            <div class="footer-item">
              <span class="footer-label">Text:</span>
              <span class="footer-value">{{ item.author }}</span>
            </div>
            <div class="footer-item">
              <span class="footer-label">Duration:</span>
              <span class="footer-value">{{ item.duration }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Portfolio Page Detail View -->
    <PortfolioPage v-else :selectedItem="selectedItem" @back="handleBack" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import PortfolioPage from "./PortfolioPage.vue";

const view = ref("list");
const selectedItem = ref(null);

const portfolioItems = [
  {
    id: 1,
    date: "16. March 2026",
    category: "ART",
    title: "Hope dies last",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    author: "Jakob Gronberg",
    duration: "1 Min",
    image:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    date: "16. March 2026",
    category: "ART",
    title: "Don't close your eyes",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    author: "Jakob Gronberg",
    duration: "1 Min",
    image:
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    date: "16. March 2026",
    category: "SCULPTURES",
    title: "The best art museums",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    author: "Jakob Gronberg",
    duration: "1 Min",
    image:
      "https://images.unsplash.com/photo-1554188248-986adbb73be4?q=80&w=800&auto=format&fit=crop",
  },
];

const handleItemClick = (item) => {
  selectedItem.value = item;
  view.value = "detail";
  window.scrollTo(0, 0);
};

const handleBack = () => {
  view.value = "list";
  selectedItem.value = null;
};
</script>

<style scoped>
/* Base Reset & Variables */
:root {
  --border-color: #e5e5e5;
  --bg-color: #fafafa;
  --text-main: #000000;
  --text-muted: #888888;
}

:global(body) {
  margin: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: var(--text-main);
  background-color: var(--bg-color);
  -webkit-font-smoothing: antialiased;
}

.app-container {
  min-height: 100vh;
}

/* List View Styles */
.list-view {
  max-width: 1280px;
  margin: 0 auto;
  padding: 40px 20px;
}

.list-header {
  padding: 80px 0;
  border-bottom: 1px solid var(--border-color);
  text-align: center;
  margin-bottom: 48px;
}

.main-title {
  font-size: 12vw;
  font-weight: 900;
  letter-spacing: -0.05em;
  margin: 0;
}

.controls {
  margin-bottom: 48px;
}

.category-filter {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 10px;
  font-weight: bold;
}

.filter-buttons {
  display: flex;
  gap: 8px;
}

.btn-filter {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  background: transparent;
  cursor: pointer;
  text-transform: uppercase;
  font-size: inherit;
  font-weight: inherit;
  transition: all 0.2s;
}

.btn-filter.active {
  background: black;
  color: white;
  border-color: black;
}

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  border-left: 1px solid var(--border-color);
  border-top: 1px solid var(--border-color);
}

.portfolio-card {
  background: white;
  padding: 32px;
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background 0.2s ease;
}

.portfolio-card:hover {
  background: #fdfdfd;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--text-muted);
  margin-bottom: 24px;
}

.category-tag {
  border: 1px solid var(--border-color);
  padding: 2px 8px;
  border-radius: 10px;
  color: var(--text-main);
}

.card-image-wrapper {
  aspect-ratio: 1 / 1;
  background: #eee;
  margin-bottom: 24px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.portfolio-card:hover .card-image {
  transform: scale(1.05);
}

.card-title {
  font-size: 24px;
  font-weight: 800;
  margin: 0 0 16px 0;
  letter-spacing: -0.02em;
}

.card-desc {
  font-size: 12px;
  line-height: 1.6;
  color: #555;
  margin-bottom: 32px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  font-weight: bold;
}

.footer-label {
  color: var(--text-muted);
  text-transform: uppercase;
  margin-right: 4px;
}
</style>
