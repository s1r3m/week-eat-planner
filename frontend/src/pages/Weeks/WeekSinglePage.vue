<template>
  <template v-if="weekStore.error">
    <div>
      <h3>Could not load your weeks at the moment. Please try again.</h3>
      <Button>Retry now</Button>
    </div>
  </template>

  <template v-else-if="weekStore.isLoading">
    <TheLoadingSpinner loading-name="weeks" />
  </template>
  <template v-else-if="week">
    <div class="space-y-8 mb-8">
      <PageTitle :header="week.name" description="Plan your meal to each day" />

      <Card v-for="(day, idx) in groupedMealSlots" :key="days[idx]" class="mx-4">
        <CardHeader>
          <CardTitle> {{ days[idx] }}</CardTitle>
        </CardHeader>
        <CardContent class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card v-for="mealSlot in day" :key="mealSlot.id" variant="slot">
            <MealSlotContent :meal-slot="mealSlot" />
          </Card>
        </CardContent>
      </Card>
    </div>
  </template>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Ref } from 'vue';
import type { UserWeek } from '@/api/types/api';
import { useRoute } from 'vue-router';
import { useWeekStore } from '@/features/week/store/weeks';
import MealSlotContent from '@/features/mealSlot/components/MealSlotContent.vue';
import PageTitle from '@/components/shared/PageTitle.vue';
import { Button } from '@/components/ui/button';
import TheLoadingSpinner from '@/components/app/TheLoadingSpinner.vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const week: Ref<UserWeek | null> = ref(null);
const weekStore = useWeekStore();
const route = useRoute();
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']; // TODO: Use constants WEP-46

// TODO: update API response to include -- WEP-46.
const groupedMealSlots = computed(() => {
  const uniqueDays = [...new Set(week.value?.meal_slots.map((m) => m.day_of_week))];
  return uniqueDays.map((day) => week.value?.meal_slots.filter((m) => m.day_of_week === day));
});

watch(route, async () => (week.value = await weekStore.getWeek(route.params.id as string)), {
  immediate: true,
});
</script>
