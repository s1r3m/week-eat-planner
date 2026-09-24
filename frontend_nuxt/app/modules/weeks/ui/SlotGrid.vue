<script setup lang="ts">
  import type { MealSlot, MealType, WeekFull } from '@/modules/weeks/types'

  defineProps<{ week: WeekFull }>()

  const mealTypeOrder: Record<MealType, number> = {
    BREAKFAST: 0,
    DINNER: 3,
    LUNCH: 1,
    SNACK: 2,
  }
  const sortSlots = (slots: MealSlot[]) => {
    return [...slots].sort(
      (a, b) => mealTypeOrder[a.meal_type] - mealTypeOrder[b.meal_type],
    )
  }
</script>

<template>
  <div
    v-if="week.week_days"
    class="meal-slot-grid"
  >
    <div
      v-for="day in week.week_days"
      :key="day.name"
      class="meal-slot-grid__day"
    >
      <p class="meal-slot-grid__day-title">{{ day.name }}</p>

      <div
        v-if="day.slots"
        class="meal-slot-grid__day-block"
      >
        <WeekSlotCard
          v-for="slot in sortSlots(day.slots)"
          :key="slot.id"
          :meal-slot="slot"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .meal-slot-grid {
    display: flex;
    flex-direction: column;
    margin-top: var(--space-4);
    gap: var(--space-4);
  }

  .meal-slot-grid__day {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background-color: var(--bg-elevated);
  }

  .meal-slot-grid__day-title {
    text-align: left;
  }

  .meal-slot-grid__day-block {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: var(--space-2);
  }

  @container (width > 600px) {
    .meal-slot-grid__day-block {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @container (width > 920px) {
    .meal-slot-grid__day-block {
      grid-template-columns: repeat(4, 1fr);
    }
  }
</style>
