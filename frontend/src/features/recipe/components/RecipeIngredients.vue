<template>
  <div class="flex-1 space-y-3">
    <h2 class="text-title-md font-semibold text-primary">Ingredients:</h2>
    <div>
      <ul class="list-disc marker:text-primary marker:font-bold space-y-1">
        <li
          v-for="item in ingredients"
          :key="item.name"
          class="leading-relaxed text-on-surface-variant text-body-md ml-4"
        >
          <IngredientItem :name="item.name" :amount="item.amount" :unit="item.unit" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ingredient } from '@/api/recipes';
import IngredientItem from '@/components/shared/IngredientItem.vue';

defineProps<{
  ingredients: Ingredient[];
}>();
</script>
