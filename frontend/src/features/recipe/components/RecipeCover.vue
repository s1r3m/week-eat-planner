<template>
  <div class="flex-1 bg-primary/20 shadow-lg rounded-2xl p-6 opacity-90">
    <img :src="src || defaultImg" :alt="alt" class="object-cover" loading="lazy" decoding="async" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  src?: string;
  alt: string;
}>();
const defaultImg = new URL('@/assets/recipe_bg.png', import.meta.url).href;
</script>
