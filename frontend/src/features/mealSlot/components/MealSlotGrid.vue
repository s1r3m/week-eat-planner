<template>
  <Card v-for="day in weekDays" :key="day.name" class="mx-6">
    <CardHeader>
      <CardTitle> {{ t(`daysOfWeek.${day.name}`) }}</CardTitle>
    </CardHeader>
    <CardContent class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
      <MealSlotGridCard v-for="mealSlot in day.slots" :key="mealSlot.id" :meal-slot="mealSlot" />
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MealSlotGridCard from './MealSlotGridCard.vue';
import type { WeekDay } from '@/domain/week/models';
import { useI18n } from 'vue-i18n';

defineProps<{
  weekDays: WeekDay[];
}>();

const { t } = useI18n();
</script>
