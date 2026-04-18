<template>
  <div class="cursor-pointer">
    <MealSlotEmptyCard v-if="!mealSlot.recipe" :meal-type="mealSlot.meal_type" />
    <MealSlotRecipeCard v-else :meal-type="mealSlot.meal_type" :recipe="mealSlot.recipe" />
  </div>
</template>

<script setup lang="ts">
import type { MealSlot } from '@/api/weeks';
import MealSlotEmptyCard from './MealSlotEmptyCard.vue';
import MealSlotRecipeCard from './MealSlotRecipeCard.vue';

defineProps<{
  mealSlot: MealSlot;
}>();
</script>
