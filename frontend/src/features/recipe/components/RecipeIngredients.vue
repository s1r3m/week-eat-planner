<template>
  <div class="flex-1 space-y-3">
    <h2 class="font-semibold text-primary">Ingredients:</h2>
    <div>
      <ul class="list-disc marker:text-primary marker:font-bold space-y-1">
        <li
          v-for="item in ingredients"
          :key="item.name"
          class="leading-relaxed text-muted-foreground ml-4"
        >
          <div class="flex items-center justify-between">
            <span>{{ item.name }}</span>
            <span class="">{{ item.amount }} {{ item.unit }}</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ingredient } from '@/api/recipes';

defineProps<{
  ingredients: Ingredient[];
}>();
</script>
