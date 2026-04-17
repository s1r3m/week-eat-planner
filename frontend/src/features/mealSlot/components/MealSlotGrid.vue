<template>
  <Card v-for="day in weekDays" :key="day.name">
    <CardHeader>
      <CardTitle> {{ t(`daysOfWeek.${day.name}`) }}</CardTitle>
    </CardHeader>
    <CardContent class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
      <MealSlotGridCard
        v-for="mealSlot in sortSlots(day.slots)"
        :key="mealSlot.id"
        :meal-slot="mealSlot"
        @click="$emit('selectSlot', mealSlot)"
      />
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MealSlotGridCard from './MealSlotGridCard.vue';
import type { MealSlot, WeekDay, MealType } from '@/api/weeks';
import { useI18n } from 'vue-i18n';

defineProps<{
  weekDays: WeekDay[];
}>();

defineEmits<{
  selectSlot: [MealSlot: MealSlot];
}>();

const { t } = useI18n();

const mealTypeOrder: Record<MealType, number> = {
  BREAKFAST: 0,
  LUNCH: 1,
  DINNER: 3,
  SNACK: 2,
};

const sortSlots = (slots: MealSlot[]) => {
  return [...slots].sort((a, b) => mealTypeOrder[a.meal_type] - mealTypeOrder[b.meal_type]);
};
</script>
