<template>
  <div class="grid gap-6 grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 px-6">
    <RecipePreview
      v-for="recipe in recipes"
      :key="recipe.id"
      :recipe="recipe"
      @toggle-favorite="$emit('toggleFavorite', recipe)"
    />
    <AppAddCard @create="router.push('/recipes/create')" />
  </div>
</template>

<script setup lang="ts">
import AppAddCard from '@/components/shared/AppAddCard.vue';
import RecipePreview from './RecipePreview.vue';
import type { RecipeMinimal } from '@/domain/recipe/models';
import { useRouter } from 'vue-router';

const router = useRouter();

defineProps<{
  recipes: RecipeMinimal[];
}>();

defineEmits<{
  toggleFavorite: [recipe: RecipeMinimal];
}>();
</script>
