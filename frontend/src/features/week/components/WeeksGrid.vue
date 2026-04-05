<template>
  <div v-if="!weeks.length" class="flex justify-center-safe">
    <div
      class="flex flex-col gap-6 items-center-safe border-10 border-muted w-full p-6 mt-12 rounded-xl text-muted-foreground"
    >
      <MessageCircleDashed :size="42" />
      <h2 class="text-lg">No weeks yet</h2>
      <p>Try and add one to start your planning journey!</p>
    </div>
  </div>
  <div v-else class="grid gap-9 lg:grid-cols-2 xl:grid-cols-3 xl:gap-12">
    <WeekDetails v-for="week in weeks" :key="week.id" :week="week" />
  </div>
</template>

<script setup lang="ts">
import { WeekDetails } from '@/features/week';
import { MessageCircleDashed } from 'lucide-vue-next';

import type { WeekPreview } from '@/api/weeks';

defineProps<{
  weeks: WeekPreview[];
}>();
</script>
