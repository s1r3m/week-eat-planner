<template>
  <div v-if="!weeks.length" class="flex justify-center-safe">
    <div
      class="flex flex-col gap-6 items-center-safe border-2 border-muted w-full p-6 mt-12 rounded-xl"
    >
      <MessageCircleDashed :size="42" />
      <h2 class="text-lg font-semibold">No weeks yet</h2>
      <p class="text-muted-foreground">Try and add one to start your planning journey!</p>
    </div>
  </div>
  <div v-else class="grid gap-9 lg:grid-cols-2 xl:grid-cols-3 xl:gap-12">
    <WeekDetails v-for="week in weeks" :key="week.id" :week="week" />
  </div>
</template>

<script setup lang="ts">
import { WeekDetails } from '@/features/week';
import type { UserWeekMinimal } from '@/domain/week/models';
import { MessageCircleDashed } from 'lucide-vue-next';

defineProps<{
  weeks: UserWeekMinimal[];
}>();
</script>
