<template>
  <div class="grid gap-6 grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
    <RecipePreview
      v-for="recipe in recipes"
      :key="recipe.id"
      :recipe="recipe"
      @toggle-favorite="$emit('toggleFavorite', recipe)"
    />
    <AppAddCard @create="onCreate" />
  </div>
</template>

<script setup lang="ts">
import AppAddCard from '@/components/shared/AppAddCard.vue';
import RecipePreview from './RecipePreview.vue';
import type { RecipeMinimal } from '@/domain/recipe/models';
import { useRouter } from 'vue-router';
import { ROUTE_NAMES } from '@/domain/router/routeNames';

const router = useRouter();

defineProps<{
  recipes: RecipeMinimal[];
}>();

defineEmits<{
  toggleFavorite: [recipe: RecipeMinimal];
}>();

const onCreate = () => router.push({ name: ROUTE_NAMES.RECIPES_CREATE });
</script>
