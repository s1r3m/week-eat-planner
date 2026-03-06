<template>
  <div v-if="week" class="space-y-9 mb-9">
    <PageTitle :header="week.name" description="Plan your meal to each day" />

    <Card v-for="(day, idx) in groupedMealSlots" :key="days[idx]" class="mx-6">
      <CardHeader>
        <CardTitle> {{ days[idx] }}</CardTitle>
      </CardHeader>
      <CardContent class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <MealSlotCard v-for="mealSlot in day" :key="mealSlot.id" :meal-slot="mealSlot" />
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useWeekStore } from '@/features/week';
import { MealSlotCard } from '@/features/mealSlot';
import PageTitle from '@/components/shared/PageTitle.vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAsyncCall } from '@/features/auth/composables/useAsyncCall';

// TODO: Use constants WEP-46
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const weekStore = useWeekStore();
const route = useRoute();

const { call: getWeek, isLoading } = useAsyncCall(
  async () => await weekStore.getWeek(route.params.id as string),
);
const data = await getWeek();
const week = ref(data);

// TODO: update API response to include -- WEP-46.
const groupedMealSlots = computed(() => {
  const daysKeys = days.map((day) => day.toUpperCase());
  return daysKeys.map((day) => week.value?.meal_slots.filter((m) => m.day_of_week === day));
});
</script>
