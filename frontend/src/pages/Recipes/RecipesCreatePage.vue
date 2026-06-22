<template>
  <div id="createRecipePage" class="space-y-6 m-6">
    <PageTitle header="Create a recipe" />
    <RecipeCreateForm @create="onCreate" @cancel="onCancel" />
  </div>
</template>

<script setup lang="ts">
import { useMutation } from '@pinia/colada';
import { useRouter } from 'vue-router';
import { addImageMutation, addRecipeMutation } from '@/api/recipes';
import type { RecipePayload } from '@/api/recipes';
import { ROUTE_NAMES } from '@/domain/router/routeNames';

import PageTitle from '@/components/shared/PageTitle.vue';
import RecipeCreateForm from '@/features/recipe/components/RecipeCreateForm.vue';

const router = useRouter();

const { mutateAsync: create } = useMutation(addRecipeMutation());
const { mutate: upload } = useMutation(addImageMutation());

const onCreate = async (payload: RecipePayload, image: File | null) => {
  const createdRecipe = await create(payload);
  if (image) upload({ id: createdRecipe.id, image });
  router.push({ name: ROUTE_NAMES.RECIPES_MY });
};

const onCancel = () => router.push({ name: ROUTE_NAMES.RECIPES_MY });
</script>
