<template>
  <div class="flex-1 bg-muted rounded-2xl shadow-lg p-6">
    <h2 class="font-semibold text-primary pb-3">Ingredients:</h2>
    <ul class="list-disc marker:text-primary marker:font-bold pl-6 space-y-3">
      <li
        v-for="item in ingredients"
        :key="item.name"
        class="leading-relaxed text-muted-foreground"
      >
        <div class="flex items-center justify-between">
          <span>{{ item.name }}</span>
          <span class="">{{ item.amount }} {{ item.unit }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { Ingredient } from '@/domain/recipe/models';

defineProps<{
  ingredients: Ingredient[];
}>();
</script>
