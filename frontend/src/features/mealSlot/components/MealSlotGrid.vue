<template>
  <Card v-for="day in weekDays" :key="day.name">
    <CardHeader>
      <CardTitle> {{ t(`daysOfWeek.${day.name}`) }}</CardTitle>
    </CardHeader>
    <CardContent class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
      <MealSlotGridCard
        v-for="mealSlot in day.slots"
        :key="mealSlot.id"
        :meal-slot="mealSlot"
        @select-slot="$emit('selectSlot', $event)"
      />
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MealSlotGridCard from './MealSlotGridCard.vue';
import type { MealSlot, WeekDay } from '@/api/weeks';
import { useI18n } from 'vue-i18n';

defineProps<{
  weekDays: WeekDay[];
}>();

defineEmits<{
  selectSlot: [MealSlot: MealSlot];
}>();

const { t } = useI18n();
</script>
