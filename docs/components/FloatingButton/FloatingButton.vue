<template>
  <a class="floating-button" :href="`#${id}`">
    <div class="text">{{ name ?? id }}</div>
  </a>
</template>

<script setup lang="ts">
export type FloatingButtonItem = {
  name: string | undefined;
  id: string;
};
defineProps<{
  name: string | undefined;
  id: string;
}>();
</script>

<style scoped>
.floating-button {
  border: 1px solid #000;
  border-radius: 50px;
  text-decoration: none;

  width: 200px;
  height: 90px;

  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    background: #000;
  }
}
</style>
