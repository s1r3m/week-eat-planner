<template>
  <Card variant="slot">
    <CardContent>
      <CardTitle class="text-center text-muted-foreground">
        {{ mealSlot.meal_type }}
      </CardTitle>
      <CardDescription
        class="flex items-center gap-1 text-sm font-light text-muted-foreground pt-2"
      >
        {{ mealSlot.recipe ? mealSlot.recipe.name : 'Assign a recipe' }}
      </CardDescription>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import type { MealSlot } from '@/domain/week/models';

defineProps<{
  mealSlot: MealSlot;
}>();
</script>
