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

  <template v-else>
    <div class="space-y-8">
      <div class="px-8 pt-8">
        <h1 class="text-2xl font-semibold tracking-tight">My Weeks</h1>
      </div>
      <div class="grid gap-8 lg:grid-cols-2 2xl:grid-cols-3 px-8">
        <PresentCard v-for="week in weekStore.weeks" :key="week.id" class="max-h-80">
          <WeekDetails :week="week" />
        </PresentCard>
        <PresentCard v-if="weekStore.weeks.length < 6" class="max-h-80">
          <WeekCreateForm />
        </PresentCard>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { useWeekStore } from '@/features/week/store/weeks';

import PresentCard from '@/components/shared/PresentCard.vue';
import WeekDetails from '@/features/week/components/WeekDetails.vue';
import WeekCreateForm from '@/features/week/components/WeekCreateForm.vue';
import { Button } from '@/components/ui/button';
import TheLoadingSpinner from '@/components/app/TheLoadingSpinner.vue';

const weekStore = useWeekStore();
weekStore.fetchWeeks();
</script>

<style scoped>
@import 'tailwindcss';

.grid-container {
  @apply grid gap-4 lg:grid-cols-2 2xl:grid-cols-3;
}

.grid-item {
  @apply max-h-80;
}
</style>
