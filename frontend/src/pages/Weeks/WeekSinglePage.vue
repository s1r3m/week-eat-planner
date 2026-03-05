<template>
  <div class="space-y-9 mb-9">
    <PageTitle :header="week.name" description="Plan your meal to each day" />

    <Card v-for="(day, idx) in groupedMealSlots" :key="days[idx]" class="mx-6">
      <CardHeader>
        <CardTitle> {{ days[idx] }}</CardTitle>
      </CardHeader>
      <CardContent class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <Card v-for="mealSlot in day" :key="mealSlot.id" variant="slot">
          <MealSlotContent :meal-slot="mealSlot" />
        </Card>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { UserWeek } from '@/domain/week/models';
import { useRoute } from 'vue-router';
import { useWeekStore } from '@/features/week';
import { MealSlotContent } from '@/features/mealSlot';
import PageTitle from '@/components/shared/PageTitle.vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const weekStore = useWeekStore();
const route = useRoute();
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']; // TODO: Use constants WEP-46

const week = ref((await weekStore.getWeek(route.params.id as string)) as UserWeek);

// TODO: update API response to include -- WEP-46.
const groupedMealSlots = computed(() => {
  const uniqueDays = [...new Set(week.value?.meal_slots.map((m) => m.day_of_week))];
  return uniqueDays.map((day) => week.value?.meal_slots.filter((m) => m.day_of_week === day));
});
</script>
