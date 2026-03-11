<template>
  <div class="portfolio-card glassmorphism-bg" @click="onCardClick">
    <header>
      <h3>{{ props.subHeader }}</h3>
      <h1>{{ props.header }}</h1>
      <PortfolioCardProjectTypeBadge
        class="project-type-badge"
        :value="props.projectType"
      />
    </header>
    <main></main>
    <footer>
      <div class="date">{{ props.date }}</div>
      <div class="skill-badges">
        <PortfolioSkillBadge
          v-for="badge in props.skillBadges"
          :skill-badge="badge"
        />
      </div>
    </footer>
  </div>
  <PortfolioCardContent ref="modal">
    <slot></slot>
  </PortfolioCardContent>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue";
import PortfolioCardContent from "./PortfolioCardContent.vue";
import PortfolioCardProjectTypeBadge from "./PortfolioCardProjectTypeBadge.vue";
import type { ProjectTypeBadge, SkillBadge } from "./types";
import PortfolioSkillBadge from "./PortfolioSkillBadge.vue";
type Props = {
  header: string;
  subHeader: string;
  skillBadges: SkillBadge[];
  tags: string[];
  date: string;
  projectType: ProjectTypeBadge;
};
const props = defineProps<Props>();
const modal = useTemplateRef("modal");

const onCardClick = () => {
  modal.value?.$el.showModal();
};
</script>

<style scoped>
.portfolio-card {
  border-radius: 8px;
  display: grid;
  grid-template:
    "header" 100px
    "main" 1fr
    "footer" 35px
    / 1fr;

  padding: 18px;
  cursor: pointer;

  & > header {
    grid-area: header;

    display: grid;
    grid-template:
      "sub-title project-type-badge" 30px
      "title project-type-badge" 1fr
      / 90% 1fr;

    & > h3 {
      margin: 0;
      grid-area: sub-title;

      /* color: var(--Primary-Normal); */
      color: var(--Neutral-90);
      /* font-family: "Sora" sans-serif; */
      font-size: 14pt;
      font-weight: 800;
    }

    & > h1 {
      grid-area: title;
      margin: 0;
      /* font-family: "Black Ops One", system-ui; */

      font-size: 32pt;
      font-weight: 800;
    }

    & > .project-type-badge {
      grid-area: project-type-badge;
      margin-top: 5px;
      /* align-self: center; */
      justify-self: center;
    }
  }

  & > main {
    grid-area: main;
  }

  & > footer {
    grid-area: footer;

    display: grid;
    grid-template-columns: 1fr 200px;
    align-items: center;

    & > .date {
      font-size: 14pt;
      font-weight: 800;
    }

    & > .skill-badges {
      justify-self: end;

      display: flex;
      column-gap: 4px;
    }
  }
}
</style>
