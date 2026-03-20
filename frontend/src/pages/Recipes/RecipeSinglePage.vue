<template>
  <div v-if="recipe" id="recipe-container" class="space-y-6">
    <PageTitle :header="recipe.name" :description="recipe.author ?? ''" />
    <div id="recipe-show m-6">
      {{ recipe }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import PageTitle from '@/components/shared/PageTitle.vue';
import { useAsyncCall } from '@/composables/useAsyncCall';

import { useRecipeStore } from '@/features/recipe';
import { useRoute } from 'vue-router';

const recipeStore = useRecipeStore();
const route = useRoute();

const { call: getRecipe } = useAsyncCall(
  async () => await recipeStore.getRecipe(route.params.id as string),
);
const data = await getRecipe();
const recipe = ref(data);
</script>
