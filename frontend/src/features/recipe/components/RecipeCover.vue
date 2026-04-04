<template>
  <Card class="flex-1 p-0">
    <CardContent class="p-0">
      <img
        :src="src || defaultImg"
        :alt="alt"
        class="object-cover h-72 w-full bg-primary/20 rounded-xl"
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
