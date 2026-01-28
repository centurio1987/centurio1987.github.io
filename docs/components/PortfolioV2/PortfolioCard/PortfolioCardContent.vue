<template>
  <dialog class="portfolio-card-content" ref="modal">
    <ModalCloseImg class="close" @click="modal?.close()" />
    <article class="content">
      <slot></slot>
    </article>
  </dialog>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue";
import ModalCloseImg from "./ModalCloseImg.vue";

const modal = useTemplateRef("modal");
</script>

<style scoped>
.portfolio-card-content {
  &[open] {
    display: grid;
    width: 90%;
    height: 90%;
    min-height: 500px;
    padding: 35px 42px;

    gap: 15px;
    row-gap: 15px;
    border: 1px solid #000;
    overflow-y: auto;
    border-radius: 8px;

    background: var(--Neutral-20);

    grid-template:
      "nav" 18px
      "contents" 1fr;

    &::backdrop {
      background: rgba(255, 255, 255, 0.25);
    }

    & > .close {
      grid-area: nav;
      justify-self: end;
    }

    & > article.content {
      border-radius: 15px;
    }
  }
}
</style>
