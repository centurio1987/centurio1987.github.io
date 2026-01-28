<template>
  <div class="portfolio">
    <ScrollAnimatedSectionList>
      <ScrollAnimatedSection>
        <PortfolioEntry />
      </ScrollAnimatedSection>
      <ScrollAnimatedSection>
        <PortfolioMain>
          <template v-for="(slot, name) in $slots" #[name]>
            <slot :name="name"></slot>
          </template>
        </PortfolioMain>
      </ScrollAnimatedSection>
    </ScrollAnimatedSectionList>
  </div>
</template>

<script setup lang="ts">
import ScrollAnimatedSectionList from "../ScrollAnimated/ScrollAnimatedSectionList.vue";
import ScrollAnimatedSection from "../ScrollAnimated/ScrollAnimatedSection.vue";
import PortfolioEntry from "./PortfolioEntry/PortfolioEntry.vue";
import PortfolioMain from "./PortfolioMain/PortfolioMain.vue";
</script>

<style scoped>
.portfolio {
  min-width: 1440px;
  max-width: 1920px;
  flex-shrink: 0;
  overflow-x: auto;
}
</style>
