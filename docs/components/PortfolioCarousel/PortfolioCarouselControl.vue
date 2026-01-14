<template>
  <div class="prev" @click="$emit('control:active', 'prev')"></div>
  <div class="next" @click="$emit('control:active', 'next')"></div>
</template>

<script setup lang="ts">
defineEmits<{
  (e: "control:active", direction: "prev" | "next"): void;
}>();
</script>

<style scoped>
.prev {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  /* background: url('/assets/left-arrow.svg') no-repeat center center; */
  background: goldenrod;
  background-size: contain;
  cursor: pointer;
  z-index: 10;
}

.next {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  /* background: url('/assets/right-arrow.svg') no-repeat center center; */
  background: goldenrod;
  background-size: contain;
  cursor: pointer;
  z-index: 10;
}
</style>
