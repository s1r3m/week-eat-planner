<template>
  <div class="mx-auto max-w-7xl">
    <div class="flex flex-col">
      <div>
        <RecipeInfoEdit v-model:name="name" />
        <FieldSeparator class="my-6" />
        <RecipeIngredientsEdit v-model:ingredients="ingredients" />
        <FieldSeparator class="my-6" />
        <RecipeStepsEdit v-model:steps="steps" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Ingredient, CookingStep, RecipePayload } from '@/domain/recipe/models';
import RecipeInfoEdit from './RecipeInfoEdit.vue';
import RecipeIngredientsEdit from './RecipeIngredientsEdit.vue';
import RecipeStepsEdit from './RecipeStepsEdit.vue';
import { FieldSeparator } from '@/components/ui/field';

const name = ref('');
const steps = ref<CookingStep[]>([{ order: 0, step: '' }]);
const ingredients = ref<Ingredient[]>([{ name: '', amount: 0, unit: 'g' }]);

defineEmits<{
  create: [RecipePayload];
}>();
</script>
