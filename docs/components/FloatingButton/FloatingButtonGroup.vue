<template>
  <div class="floating-button-group">
    <FloatingButton
      v-for="item in items"
      :id="item.id"
      :name="item.name"
    ></FloatingButton>
  </div>
</template>

<script setup lang="ts">
import FloatingButton from "./FloatingButton.vue";
import { type FloatingButtonItem } from "./FloatingButton.vue";

defineProps<{ items: FloatingButtonItem[] }>();
</script>

<style scoped>
.floating-button-group {
  position: fixed;
  top: 20px;
  left: 50%;
  width: fit-content;
  transform: translateX(-50%);

  background: rgb(226, 110, 130);

  display: flex;
  flex-flow: row;
  justify-content: center;
  gap: 12px;
  z-index: 1;
}
</style>
