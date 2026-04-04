<template>
  <div v-if="recipe" class="space-y-6 m-6">
    <PageTitle :header="recipe.name" :description="description">
      <template #controls>
        <Button
          :variant="recipe.isFavorite ? 'outline' : 'default'"
          size="lg"
          :aria-label="!recipe.isFavorite ? 'Add to favorites' : 'Remove from favorites'"
          @click="recipe.isFavorite = !recipe.isFavorite"
          ><Star v-bind="starProps" :class="{ 'text-transparent': recipe.isFavorite }" />
          <span class="hidden md:inline"
            >{{ !recipe.isFavorite ? 'Add to' : 'Remove from' }} favorites
          </span></Button
        >
        <Button variant="outline" size="lg" aria-label="Edit recipe"
          ><Pen /> <span class="hidden md:inline"> Edit </span></Button
        >
        <Button
          variant="destructiveOutline"
          size="lg"
          aria-label="Delete recipe"
          @click="onDelete(recipe.id)"
        >
          <Trash /><span class="hidden md:inline"> Delete </span>
        </Button>
      </template>
    </PageTitle>

    <div class="flex flex-col gap-6">
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
import { useRoute, useRouter } from 'vue-router';
import RecipeHero from '@/features/recipe/components/RecipeHero.vue';
import RecipeSteps from '@/features/recipe/components/RecipeSteps.vue';
import { Star, Trash, Pen } from 'lucide-vue-next';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ROUTE_NAMES } from '@/domain/router/routeNames';

const recipeStore = useRecipeStore();
const route = useRoute();
const router = useRouter();

const { call: getRecipe } = useAsyncCall(
  async () => await recipeStore.getRecipe(route.params.id as string),
);
const data = await getRecipe();
const recipe = ref(data);

const description = computed(() => (recipe.value?.author ? `By ${recipe.value?.author}` : ''));
const starProps = computed(() =>
  recipe.value?.isFavorite
    ? {
        fill: 'var(--primary)',
        'stroke-width': 0,
      }
    : {},
);

const { call: deleteRecipe } = useAsyncCall((recipeId: string) =>
  recipeStore.deleteRecipe(recipeId),
);

const onDelete = async (recipeId: string) => {
  await deleteRecipe(recipeId);
  router.push({ name: ROUTE_NAMES.RECIPES_MY });
};
</script>
