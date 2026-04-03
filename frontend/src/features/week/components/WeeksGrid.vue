<template>
  <div class="grid gap-9 lg:grid-cols-2 xl:grid-cols-3 xl:gap-12">
    <WeekDetails
      v-for="week in weeks"
      :key="week.id"
      :week="week"
      @edit="$emit('edit', week)"
      @delete="$emit('delete', week)"
    />
  </div>
</template>

<script setup lang="ts">
import { WeekDetails } from '@/features/week';
import type { UserWeekMinimal } from '@/domain/week/models';

defineProps<{
  weeks: UserWeekMinimal[];
}>();

defineEmits<{
  edit: [week: UserWeekMinimal];
  delete: [week: UserWeekMinimal];
}>();
</script>
