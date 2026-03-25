<template>
  <Card class="flex-1 shadow-lg rounded-2xl p-0">
    <CardContent class="px-0">
      <img
        :src="src || defaultImg"
        :alt="alt"
        class="object-cover w-full"
        loading="lazy"
        decoding="async"
      />
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card';

defineProps<{
  src?: string;
  alt: string;
}>();
const defaultImg = new URL('@/assets/recipe_bg.png', import.meta.url).href;
</script>
