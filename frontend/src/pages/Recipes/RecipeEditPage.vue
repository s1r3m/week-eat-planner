<template>
  <div>
    <div v-if="recipe" id="editRecipePage" class="space-y-6 m-6">
      <PageTitle :header="`Edit ${recipe.name}`" />
      <RecipeEditForm
        :recipe="recipe"
        @update="onEdit"
        @cancel="router.push({ name: ROUTE_NAMES.RECIPE, params: { id: recipe.id } })"
      />
    </div>
    <ErrorRetryCard v-else-if="error" :error="error" :retry="refetch" />
    <TheLoadingPageState v-else-if="isLoading" />
    <div v-else>Recipe does not exist</div>
  </div>
</template>

<script setup lang="ts">
import { addImageMutation, editRecipeMutation, getRecipeQuery } from '@/api/recipes';
import type { RecipePayload } from '@/api/recipes';
import { useMutation, useQuery } from '@pinia/colada';
import { useRoute, useRouter } from 'vue-router';

import RecipeEditForm from '@/features/recipe/components/RecipeEditForm.vue';
import TheLoadingPageState from '@/layouts/components/TheLoadingPageState.vue';
import ErrorRetryCard from '@/components/shared/ErrorRetryCard.vue';
import PageTitle from '@/components/shared/PageTitle.vue';
import { ROUTE_NAMES } from '@/domain/router/routeNames';

const route = useRoute();
const router = useRouter();

const {
  data: recipe,
  isLoading,
  error,
  refetch,
} = useQuery(() => getRecipeQuery(String(route.params.id)));

const { mutate: update } = useMutation(editRecipeMutation());
const { mutateAsync: upload } = useMutation(addImageMutation());

const onEdit = async (payload: RecipePayload, image: File | null) => {
  const id = String(route.params.id);
  update({ id, payload });
  if (image) await upload({ id, image });
  router.push({ name: ROUTE_NAMES.RECIPE, params: { id } });
};
</script>
