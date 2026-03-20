<template>
  <div v-if="week" class="space-y-6">
    <PageTitle :header="week.name" description="Plan your meal to each day" />
    <MealSlotGrid :week-days="week.week_days" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PageTitle from '@/components/shared/PageTitle.vue';
import MealSlotGrid from '@/features/mealSlot/components/MealSlotGrid.vue';

import { useRoute } from 'vue-router';
import { useWeekStore } from '@/features/week';
import { useAsyncCall } from '@/composables/useAsyncCall';

const weekStore = useWeekStore();
const route = useRoute();

const { call: getWeek } = useAsyncCall(
  async () => await weekStore.getWeek(route.params.id as string),
);
const data = await getWeek();
const week = ref(data);
</script>
