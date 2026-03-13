<template>
  <Card id="recipe-preview-container" variant="week">
    <img
      :src="default_img"
      alt="Week Image"
      loading="lazy"
      class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
    />
    <div class="flex absolute bottom-0 z-10 bg-primary/50 h-16 w-full items-center">
      <h1 class="pl-8 text-lg font-semibold text-white drop-shadow-md">
        {{ recipe.name }}
      </h1>
    </div>
    <!-- <router-link
      :to="{ name: 'recipe', params: { id: recipe.id } }"
      class="absolute inset-0 z-20"
    ></router-link> -->
  </Card>
</template>

<script setup lang="ts">
import { Card } from '@/components/ui/card';
import type { RecipeMinimal } from '@/domain/recipe/models';

defineProps<{ recipe: RecipeMinimal }>();
defineEmits<{
  delete: [recipe: RecipeMinimal];
}>();

const default_img = new URL('@/assets/recipe_bg.png', import.meta.url).href;
</script>
