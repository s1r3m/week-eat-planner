<template>
  <Card variant="slot">
    <img
      :src="recipe.image_url || defaultImg"
      :alt="recipe.name"
      loading="lazy"
      class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 opacity-40 group-hover:scale-110"
    />

    <CardContent class="relative z-10 flex flex-col justify-between h-full p-3">
      <div class="flex justify-center">
        <Badge class="text-label-sm">{{ t(`mealTypes.${mealType}`) }}</Badge>
      </div>
      <div class="flex justify-center">
        <Badge variant="secondary" class="text-label-sm font-semibold truncate max-w-full">
          {{ recipe.name }}
        </Badge>
      </div>
    </CardContent>
  </Card>
</template>
<script setup lang="ts">
import type { RecipePreview } from '@/api/recipes';
import Badge from '@/components/ui/badge/Badge.vue';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from 'vue-i18n';

defineProps<{
  mealType: string;
  recipe: RecipePreview;
}>();

const { t } = useI18n();
const defaultImg = new URL('@/assets/recipe_bg.png', import.meta.url).href;
</script>
