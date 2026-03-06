<template>
  <CardContent>
    <CardTitle class="text-center text-muted-foreground">
      {{ mealSlot.meal_type }}
    </CardTitle>
    <CardDescription class="flex items-center gap-3 text-sm font-light text-muted-foreground pt-2">
      <Plus class="size-3" /> Assign a recipe
    </CardDescription>
  </CardContent>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next';
import { CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import type { MealSlot } from '@/domain/week/models';

defineProps<{
  mealSlot: MealSlot;
}>();
</script>
