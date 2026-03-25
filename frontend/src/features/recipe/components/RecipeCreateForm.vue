<template>
  <div class="mx-6 flex flex-col gap-3">
    <RecipeInfoEdit v-model:name="name" />
    <RecipeIngredientsEdit v-model:ingredients="ingredients" />
    <RecipeStepsEdit v-model:steps="steps" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Ingredient, CookingStep, RecipePayload } from '@/domain/recipe/models';
import RecipeInfoEdit from './RecipeInfoEdit.vue';
import RecipeIngredientsEdit from './RecipeIngredientsEdit.vue';
import RecipeStepsEdit from './RecipeStepsEdit.vue';

const name = ref('');
const steps = ref<CookingStep[]>([{ order: 0, step: '' }]);
const ingredients = ref<Ingredient[]>([{ name: '', amount: 0, unit: 'g' }]);

defineEmits<{
  create: [RecipePayload];
}>();
</script>
