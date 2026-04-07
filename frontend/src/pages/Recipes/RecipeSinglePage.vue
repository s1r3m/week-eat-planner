<template>
  <div id="recipe-container" class="space-y-6 m-6">
    <PageTitle :header="recipe?.name" :description="description">
      <template #controls>
        <Button
          :variant="isFavorite ? 'outline' : 'default'"
          size="lg"
          :aria-label="!isFavorite ? 'Add to favorites' : 'Remove from favorites'"
          @click="isFavorite = !isFavorite"
          ><Star v-bind="starProps" :class="{ 'text-transparent': isFavorite }" />
          <span class="hidden md:inline"
            >{{ !isFavorite ? 'Add to' : 'Remove from' }} favorites
          </span></Button
        >
        <Button variant="outline" size="lg" aria-label="Edit recipe"
          ><Pen /> <span class="hidden md:inline"> Edit </span></Button
        >
        <Button
          variant="destructiveOutline"
          size="lg"
          aria-label="Delete recipe"
          :disabled="!recipe"
          @click="openDelete(recipe)"
        >
          <Trash /><span class="hidden md:inline"> Delete </span>
        </Button>
      </template>
    </PageTitle>

    <ErrorRetryCard v-if="error" :err="error" :retry="refetch" />

    <div v-if="recipe" class="flex flex-col gap-6">
      <RecipeHero :recipe="recipe" />
      <Separator />
      <RecipeSteps :steps="recipe.steps" />
    </div>

    <TheLoadingPageState v-else-if="isLoading" loading-name="the recipe" />

    <RecipeDeleteDialog v-model="deletingRecipe" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useQuery } from '@pinia/colada';
import { getRecipeQuery } from '@/api/recipes';
import type { RecipePreview } from '@/api/recipes';

import PageTitle from '@/components/shared/PageTitle.vue';
import RecipeHero from '@/features/recipe/components/RecipeHero.vue';
import RecipeSteps from '@/features/recipe/components/RecipeSteps.vue';
import { Star, Trash, Pen } from 'lucide-vue-next';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import TheLoadingPageState from '@/layouts/components/TheLoadingPageState.vue';
import ErrorRetryCard from '@/components/shared/ErrorRetryCard.vue';
import RecipeDeleteDialog from '@/features/recipe/components/RecipeDeleteDialog.vue';

const route = useRoute();

const description = computed(() => (recipe.value?.author ? `By ${recipe.value?.author}` : ''));
const isFavorite = computed(() => recipe.value?.isFavorite);
const starProps = computed(() =>
  isFavorite.value
    ? {
        fill: 'var(--primary)',
        'stroke-width': 0,
      }
    : {},
);

const {
  data: recipe,
  isLoading,
  error,
  refetch,
} = useQuery(() => getRecipeQuery(String(route.params.id)));

const deletingRecipe = ref<RecipePreview | null>(null);
const openDelete = (selectedRecipe?: RecipePreview) => {
  if (selectedRecipe) deletingRecipe.value = selectedRecipe;
};
</script>
