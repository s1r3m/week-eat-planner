<template>
  <div class="mx-6 flex flex-col gap-3">
    <RecipeInfoEdit />
    <RecipeIngredientsEdit />
    <RecipeStepsEdit />
  </div>
</template>

<script setup lang="ts">
import type { RecipePayload } from '@/domain/recipe/models';
import RecipeInfoEdit from './RecipeInfoEdit.vue';
import RecipeIngredientsEdit from './RecipeIngredientsEdit.vue';
import RecipeStepsEdit from './RecipeStepsEdit.vue';

defineEmits<{
  create: [RecipePayload];
}>();
</script>
