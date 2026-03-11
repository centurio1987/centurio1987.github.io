<template>
  <article class="card" @click="$emit('click:card', props.id)">
    <!-- Card Header -->
    <div class="card-header">
      <span class="card-date">{{ date }}</span>
      <div class="card-categories">
        <span v-for="cat in category" :key="cat" class="card-category">{{
          cat
        }}</span>
      </div>
    </div>

    <!-- Image Container -->
    <div class="card-img-container">
      <img :src="imageUrl" :alt="title" class="card-img" loading="lazy" />
    </div>

    <!-- Content -->
    <div class="card-content">
      <h3 class="card-title">{{ title }}</h3>
      <p class="card-desc">{{ description }}</p>
    </div>

    <!-- Card Footer -->
    <div class="card-footer">
      <span class="skill-info">
        Skill:
        <div class="skill-display">
          <div v-for="s in skill" :key="s.name" class="skill-item">
            <img
              v-if="s.logo"
              :src="s.logo"
              :alt="s.name"
              class="skill-logo"
              :title="s.name"
            />
            <span class="card-footer-val">{{ s.name }}</span>
          </div>
        </div>
      </span>
      <span>
        Duration:
        <span class="card-footer-val">{{ duration }}</span>
      </span>
    </div>
  </article>
  <!-- <PortfolioCardDialog ref="modal" v-bind="$props">
    <slot></slot>
  </PortfolioCardDialog> -->
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue";
import type { PropType, DefineComponent } from "vue";
import PortfolioCardDialog from "./PortfolioCardDialog.vue";

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  category: {
    type: Array as PropType<string[]>,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  skill: {
    type: Array as PropType<Array<{ name: string; logo?: string }>>,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
});

defineEmits<{
  (e: "click:card", id: number): void;
}>();

// const modal = useTemplateRef("modal");

const onCardClick = () => {
  // modal.value?.$el.showModal();
};
</script>

<style scoped>
/* --- Card Item --- */
.card {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
  background-color: transparent;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}
@media (min-width: 640px) {
  .card {
    padding: 2rem;
  }
}
.card:hover {
  background-color: var(--card-hover-bg);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-date {
  font-size: 0.625rem;
  color: var(--text-secondary);
  font-weight: 500;
  letter-spacing: 0.05em;
}

.card-categories {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.card-category {
  font-size: 0.625rem;
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 9999px;
  letter-spacing: 0.05em;
  transition: border-color 0.3s ease;
}
.card:hover .card-category {
  border-color: var(--border-strong);
}

.card-img-container {
  aspect-ratio: 1 / 1;
  margin-bottom: 1.5rem;
  overflow: hidden;
  background-color: var(--img-bg-color);
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(100%);
  transform: scale(1);
  transition:
    filter 0.5s ease,
    transform 0.5s ease;
}
.card:hover .card-img {
  filter: grayscale(0%);
  transform: scale(1.05);
}

.card-content {
  flex-grow: 1;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  line-height: 1.25;
}

.card-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.625;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  color: var(--text-primary);
  transition: border-color 0.3s ease;
}

.skill-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.skill-display {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.skill-logo {
  width: 1rem;
  height: 1rem;
  object-fit: contain;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.card:hover .skill-logo {
  opacity: 1;
}

.card-footer-val {
  font-weight: 400;
  color: var(--text-secondary);
}
</style>
