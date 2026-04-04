<template>
  <div class="grid gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
    <RecipePreview v-for="recipe in recipes" :key="recipe.id" :recipe="recipe" />
  </div>
</template>

<script setup lang="ts">
import RecipePreview from './RecipePreview.vue';
import type { RecipeMinimal } from '@/domain/recipe/models';

defineProps<{
  recipes: RecipeMinimal[];
}>();
</script>
