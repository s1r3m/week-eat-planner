<template>
  <FieldGroup>
    <FieldTitle class="font-semibold text-lg text-primary"> Ingredients: </FieldTitle>
    <FieldContent class="flex flex-col">
      <ul class="list-disc marker:text-primary marker:text-xl">
        <li v-for="(_, idx) in ingredients" :key="idx" class="ml-4 mb-3">
          <RecipeIngredientInput
            v-model:ingredient="ingredients[idx]"
            :show-delete="idx !== ingredients.length - 1"
            @remove="ingredients.splice(idx, 1)"
          />
        </li>
      </ul>
    </FieldContent>
  </FieldGroup>
</template>

<script setup lang="ts">
import { FieldContent, FieldGroup, FieldTitle } from '@/components/ui/field';
import type { Ingredient } from '@/api/recipes';

import RecipeIngredientInput from './RecipeIngredientInput.vue';
import { watch } from 'vue';

const ingredients = defineModel<Ingredient[]>('ingredients', { required: true });

watch(
  ingredients,
  (newIngredients) => {
    const lastItem = newIngredients[newIngredients.length - 1];
    if (!lastItem || lastItem.name.trim()) {
      ingredients.value.push({ name: '', amount: 0, unit: 'g' });
    }
  },
  { deep: true, immediate: true },
);
</script>
