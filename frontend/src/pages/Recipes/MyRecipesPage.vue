<template>
  <div id="my-recipes-container" class="space-y-6 m-6">
    <PageTitle header="My Recipes" description="Recipes you have created">
      <template #controls>
        <Button size="lg" @click="router.push({ name: ROUTE_NAMES.RECIPES_CREATE })">
          <Plus />
          <span class="hidden md:inline">Add a recipe</span>
        </Button>
      </template>
    </PageTitle>

    <ErrorRetryCard v-if="error" :err="error" :retry="refetch" />
    <RecipesGrid v-else-if="myRecipes" :recipes="myRecipes" />
    <TheLoadingPageState v-else-if="isLoading" loading-name="recipes" />
  </div>
</template>

<script setup lang="ts">
import PageTitle from '@/components/shared/PageTitle.vue';
import RecipesGrid from '@/features/recipe/components/RecipesGrid.vue';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { ROUTE_NAMES } from '@/domain/router/routeNames';
import { useQuery } from '@pinia/colada';
import { getMyRecipesQuery } from '@/api/recipes';
import ErrorRetryCard from '@/components/shared/ErrorRetryCard.vue';
import TheLoadingPageState from '@/layouts/components/TheLoadingPageState.vue';

const { data: myRecipes, isLoading, error, refetch } = useQuery(getMyRecipesQuery());

const router = useRouter();
</script>
