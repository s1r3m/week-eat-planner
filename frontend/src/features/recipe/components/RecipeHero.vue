<template>
  <div class="flex flex-col-reverse md:flex-row md:items-start gap-6">
    <RecipeIngredients :ingredients="recipe.ingredients" />
    <RecipeCover :src="recipe.cover_url" :alt="recipe.name" />
  </div>
</template>
<script setup lang="ts">
import type { RecipeFull } from '@/domain/recipe/models';
import RecipeIngredients from './RecipeIngredients.vue';
import RecipeCover from './RecipeCover.vue';

defineProps<{
  recipe: RecipeFull;
}>();
</script>
