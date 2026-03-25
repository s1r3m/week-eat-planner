<template>
  <Card class="flex-1 px-6">
    <CardTitle class="font-semibold text-primary">Ingredients:</CardTitle>
    <CardContent>
      <ul class="list-disc marker:text-primary marker:font-bold space-y-3">
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
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import type { Ingredient } from '@/domain/recipe/models';

defineProps<{
  ingredients: Ingredient[];
}>();
</script>
