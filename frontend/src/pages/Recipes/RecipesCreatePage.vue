<template>
  <div id="createRecipePage" class="space-y-9 mb-9">
    <PageTitle header="Create a recipe" description="Fill the fields to create a recipe" />

    <RecipeCreateForm @create="create" />
  </div>
</template>

<script setup lang="ts">
import PageTitle from '@/components/shared/PageTitle.vue';
import { useAsyncCall } from '@/composables/useAsyncCall';
import { useRecipeStore } from '@/features/recipe';
import RecipeCreateForm from '@/features/recipe/components/RecipeCreateForm.vue';

const recipeStore = useRecipeStore();
const { call: create } = useAsyncCall(recipeStore.createRecipe);
</script>
