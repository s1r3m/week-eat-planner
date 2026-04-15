<template>
  <Card variant="slot" @click="$emit('selectSlot', mealSlot)">
    <CardContent>
      <CardTitle class="text-center text-muted-foreground">
        {{ t(`mealTypes.${mealSlot.meal_type}`) }}
      </CardTitle>
      <CardDescription
        class="flex items-center gap-1 text-sm font-light text-muted-foreground pt-3"
      >
        {{ mealSlot.recipe ? mealSlot.recipe.name : t('mealSlotCard.assignRecipe') }}
      </CardDescription>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import type { MealSlot } from '@/api/weeks';

defineProps<{
  mealSlot: MealSlot;
}>();

defineEmits<{
  selectSlot: [mealSlot: MealSlot];
}>();

const { t } = useI18n();
</script>
