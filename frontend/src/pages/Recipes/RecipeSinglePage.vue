<template>
  <div v-if="recipe" id="recipe-container" class="space-y-6">
    <PageTitle :header="recipe.name" :description="description" />
    <div id="recipe-container" class="mx-6 grid grid-cols-1 gap-3">
      <div class="flex flex-col-reverse md:flex-row">
        <div id="recipe-ingredients" class="flex-1">
          <h2>Ingredients:</h2>
          <ul class="list-disc mx-6">
            <li v-for="ingredient in recipe.ingredients" :key="ingredient.name">
              {{ ingredient.amount }} {{ ingredient.unit }} {{ ingredient.name }}
            </li>
          </ul>
        </div>
        <div id="recipe-picture" class="flex-1">
          <AspectRatio :ratio="4 / 3" class="bg-muted rounded-xl">
            <img :src="recipe.cover_url || defaultImg" :alt="recipe.name" />
          </AspectRatio>
        </div>
      </div>
      <div id="recipe-steps" class="">
        <h2>How to cook:</h2>
        <ul class="list-decimal mx-6">
          <!--TODO: create a proper key-->
          <li v-for="(step, index) in recipe.steps" :key="index">
            {{ step.action }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import PageTitle from '@/components/shared/PageTitle.vue';
import { useAsyncCall } from '@/composables/useAsyncCall';

import { useRecipeStore } from '@/features/recipe';
import { useRoute } from 'vue-router';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const recipeStore = useRecipeStore();
const route = useRoute();

const defaultImg = new URL('@/assets/recipe_bg.png', import.meta.url).href;

const description = computed(() => (recipe.value?.author ? `By ${recipe.value?.author}` : ''));
const { call: getRecipe } = useAsyncCall(
  async () => await recipeStore.getRecipe(route.params.id as string),
);
const data = await getRecipe();
const recipe = ref(data);
</script>

<style scoped></style>
