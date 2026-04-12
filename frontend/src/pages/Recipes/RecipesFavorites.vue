<template>
  <div id="favorites" class="space-y-6 m-6">
    <PageTitle header="Favorites" description="Recipes you have added to your collection" />

    <ErrorRetryCard v-if="error" :error="error" :retry="refetch" />
    <RecipesGrid v-else-if="favorites" :recipes="favorites" />
    <TheLoadingPageState v-else-if="isLoading" loading-name="favorites" />
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@pinia/colada';
import { getFavoritesQuery } from '@/api/recipes';
import PageTitle from '@/components/shared/PageTitle.vue';
import RecipesGrid from '@/features/recipe/components/RecipesGrid.vue';
import TheLoadingPageState from '@/layouts/components/TheLoadingPageState.vue';
import ErrorRetryCard from '@/components/shared/ErrorRetryCard.vue';

const { data: favorites, isLoading, error, refetch } = useQuery(getFavoritesQuery());
</script>
