<template>
  <div id="createRecipePage" class="space-y-6 m-6">
    <PageTitle header="Create a recipe" description="Fill the fields to create a recipe" />
    <RecipeCreateForm @create="onCreate" @cancel="onCancel" />
  </div>
</template>

<script setup lang="ts">
import PageTitle from '@/components/shared/PageTitle.vue';
import { useAsyncCall } from '@/composables/useAsyncCall';
import type { RecipePayload } from '@/domain/recipe/models';
import { ROUTE_NAMES } from '@/domain/router/routeNames';
import { useRecipeStore } from '@/features/recipe';
import RecipeCreateForm from '@/features/recipe/components/RecipeCreateForm.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const recipeStore = useRecipeStore();
const { call: create } = useAsyncCall(recipeStore.createRecipe);
const { call: uploadImage } = useAsyncCall(recipeStore.uploadImage);

const onCreate = async (payload: RecipePayload, image: File | null) => {
  const recipeId = await create(payload);
  if (!recipeId) return;
  if (image) await uploadImage(recipeId, image);
  await router.push({ name: ROUTE_NAMES.RECIPES_MY });
};

const onCancel = () => router.push({ name: ROUTE_NAMES.RECIPES_MY });
</script>
