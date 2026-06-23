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
      <FieldError>{{ error }}</FieldError>
    </FieldContent>
  </FieldGroup>
</template>

<script setup lang="ts">
import { watch } from 'vue';

import { useField } from 'vee-validate';

import { FieldContent, FieldGroup, FieldTitle, FieldError } from '@/components/ui/field';
import RecipeIngredientInput from './RecipeIngredientInput.vue';
import { type Ingredient } from '@/api/recipes';

const { value: ingredients, errorMessage: error } = useField<Ingredient[]>('ingredients');

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
