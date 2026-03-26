<template>
  <div v-if="recipe" id="recipe-container" class="space-y-6 m-6">
    <PageTitle :header="recipe.name" :description="description" />
    <div id="recipe-container" class="flex flex-col gap-6">
      <RecipeHero :recipe="recipe" />
      <Separator />
      <RecipeSteps :steps="recipe.steps" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import PageTitle from '@/components/shared/PageTitle.vue';
import { useAsyncCall } from '@/composables/useAsyncCall';

import { useRecipeStore } from '@/features/recipe';
import { useRoute } from 'vue-router';
import RecipeHero from '@/features/recipe/components/RecipeHero.vue';
import RecipeSteps from '@/features/recipe/components/RecipeSteps.vue';
import { Separator } from '@/components/ui/separator';

const recipeStore = useRecipeStore();
const route = useRoute();

const description = computed(() => (recipe.value?.author ? `By ${recipe.value?.author}` : ''));
const { call: getRecipe } = useAsyncCall(
  async () => await recipeStore.getRecipe(route.params.id as string),
);
const data = await getRecipe();
const recipe = ref(data);
</script>
