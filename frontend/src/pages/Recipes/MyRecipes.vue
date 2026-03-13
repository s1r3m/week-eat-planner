<template>
  <div id="my-recipes-container">
    <div class="space-y-9 mb-9">
      <PageTitle header="My Recipes" description="Recipes you have created" />
      <RecipesGrid :recipes="recipeStore.myRecipes" @create="isCreateOpen = true" />
    </div>

    <!-- <RecipeCreateDialog v-model="isCreateOpen" /> -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PageTitle from '@/components/shared/PageTitle.vue';
import RecipesGrid from '@/features/recipe/components/RecipesGrid.vue';
import { useRecipeStore } from '@/features/recipe/store/recipeStore';

const isCreateOpen = ref(false);
const recipeStore = useRecipeStore();
await recipeStore.getMyRecipes();
</script>
