<template>
  <Card variant="slot">
    <img
      :src="recipe.image_url || defaultImg"
      :alt="recipe.name"
      loading="lazy"
      class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 opacity-40 group-hover:scale-110"
    />

    <CardContent class="relative z-10 flex flex-col items-center justify-center h-full">
      <CardTitle class="text-center">
        <Badge>{{ t(`mealTypes.${mealType}`) }}</Badge>
      </CardTitle>
      <CardDescription class="flex items-center gap-1 text-label-sm font-semibold pt-1 text-center">
        <Badge variant="secondary">
          {{ recipe.name }}
        </Badge>
      </CardDescription>
    </CardContent>
  </Card>
</template>
<script setup lang="ts">
import type { RecipePreview } from '@/api/recipes';
import Badge from '@/components/ui/badge/Badge.vue';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { useI18n } from 'vue-i18n';

defineProps<{
  mealType: string;
  recipe: RecipePreview;
}>();

const { t } = useI18n();
const defaultImg = new URL('@/assets/recipe_bg.png', import.meta.url).href;
</script>
