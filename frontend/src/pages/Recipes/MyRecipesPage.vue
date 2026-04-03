<template>
  <div id="my-recipes-container" class="space-y-6 m-6">
    <PageTitle header="My Recipes" description="Recipes you have created">
      <template #controls>
        <Button size="lg">
          <Plus />
          <span class="hidden md:inline">Add a recipe</span>
        </Button>
      </template>
    </PageTitle>
    <RecipesGrid :recipes="recipeStore.myRecipes" />
  </div>
</template>

<script setup lang="ts">
import PageTitle from '@/components/shared/PageTitle.vue';
import RecipesGrid from '@/features/recipe/components/RecipesGrid.vue';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-vue-next';
import { useRecipeStore } from '@/features/recipe';

const recipeStore = useRecipeStore();
await recipeStore.getMyRecipes();
</script>
