<template>
  <div class="grid-container justify-items-center gap-8">
    <PresentCard v-for="week in weekStore.weeks" :key="week.id" class="grid-item">
      <WeekShowContent :week="week" />
    </PresentCard>
    <PresentCard v-if="weekStore.weeks.length < 6" class="grid-item">
      <WeekAddContent />
    </PresentCard>
  </div>
</template>

<script setup lang="ts">
import { useWeekStore } from '@/stores/weeks';

import PresentCard from '@/components/ui/PresentCard.vue';
import WeekShowContent from '@/components/features/week/WeekShowContent.vue';
import WeekAddContent from '@/components/features/week/WeekAddContent.vue';

const weekStore = useWeekStore();
await weekStore.fetchWeeks();
</script>

<style scoped>
@import 'tailwindcss';
@import '@/theme.css';

.grid-container {
  @apply grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3;
}

.grid-item {
  @apply max-h-80;
}
</style>
