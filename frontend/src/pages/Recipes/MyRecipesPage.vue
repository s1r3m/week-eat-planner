<template>
  <div id="my-recipes-container" class="space-y-6 m-6">
    <PageTitle header="My Recipes" description="Recipes you have created" />
    <RecipesGrid :recipes="recipeStore.myRecipes" />
  </div>
</template>

<script setup lang="ts">
import PageTitle from '@/components/shared/PageTitle.vue';
import RecipesGrid from '@/features/recipe/components/RecipesGrid.vue';
import { useRecipeStore } from '@/features/recipe';

const recipeStore = useRecipeStore();
await recipeStore.getMyRecipes();
</script>
