<template>
  <button
    class="portfolio-button glassmorphism-bg"
    @click="() => $emit('button:click', props.value.id)"
  >
    {{ props.value.value }}
  </button>
</template>

<script setup lang="ts">
type Props = {
  value: {
    id: "cto" | "po" | "backend" | "frontend";
    value: string;
  };
};
const props = defineProps<Props>();
defineEmits<{
  (e: "button:click", id: "cto" | "po" | "backend" | "frontend"): void;
}>();
</script>

<style scoped>
.portfolio-button {
  display: flex;
  width: 180px;
  padding: 25px;
  height: 55px;
  align-items: center;
  justify-content: center;
  color: white;
  border-radius: 8px;

  /* font-family: "Jersey 10", sans-serif;
  font-size: 24pt;
  font-weight: 400; */

  /* font-family: "Sora"; */
  font-family: "Black Ops One", system-ui;
  font-size: 12pt;
  font-weight: 800;

  &:focus {
    background: #ff788f;
  }
}

.selected {
  background: #ff788f;
}
</style>
