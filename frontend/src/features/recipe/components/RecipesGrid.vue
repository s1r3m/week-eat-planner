<template>
  <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 px-6">
    <RecipePreview
      v-for="recipe in recipes"
      :key="recipe.id"
      :recipe="recipe"
      @delete="$emit('delete', recipe)"
    />
    <AppAddCard @create="$emit('create')" />
  </div>
</template>

<script setup lang="ts">
import AppAddCard from '@/components/shared/AppAddCard.vue';
import RecipePreview from './RecipePreview.vue';
import type { RecipeMinimal } from '@/domain/recipe/models';

defineProps<{
  recipes: RecipeMinimal[];
}>();

defineEmits<{
  create: [];
  edit: [week: RecipeMinimal];
  delete: [week: RecipeMinimal];
}>();
</script>
