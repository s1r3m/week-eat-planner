<template>
  <div class="grid-container">
    <div v-for="(day, index) in groupedMealSlots" :key="days[index]" class="day-column">
      <h3 class="day-header">{{ days[index] }}</h3>
      <PresentCard v-for="mealSlot in day" :key="mealSlot.id" class="grid-item">
        <MealSlotContent :meal-slot="mealSlot" />
      </PresentCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Ref } from 'vue';
import type { UserWeek } from '@/types/api';
import { useRoute } from 'vue-router';
import { useWeekStore } from '@/stores/weeks';
import PresentCard from '@/components/ui/PresentCard.vue';
import MealSlotContent from '@/components/features/mealSlot/MealSlotContent.vue';

const week: Ref<UserWeek | null> = ref(null);
const weekStore = useWeekStore();
const route = useRoute();
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']; // TODO: Use constants WEP-46

// TODO: update API response to include -- WEP-46.
const groupedMealSlots = computed(() => {
  const uniqueDays = [...new Set(week.value?.meal_slots.map((m) => m.day_of_week))];
  return uniqueDays.map((day) => week.value?.meal_slots.filter((m) => m.day_of_week === day));
});

onMounted(async () => (week.value = await weekStore.getWeek(route.params.id as string)));
</script>

<style scoped>
@import 'tailwindcss';

.grid-container {
  @apply grid justify-center gap-8;
  /* TODO: Fix min size on screens after WEP-46 */
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.day-column {
  @apply flex flex-col gap-6;
}

.day-header {
  @apply text-3xl text-center pb-8 border-b;
}

.grid-item {
  @apply max-h-80;
}
</style>
