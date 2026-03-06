<template>
  <div class="grid gap-9 lg:grid-cols-2 lg:gap-12 2xl:grid-cols-3 2xl:gap-24 px-6">
    <WeekDetails
      v-for="week in weeks"
      :week="week"
      @edit="$emit('edit', week)"
      @delete="$emit('delete', week)"
    />
    <WeekAddCard v-if="weeks.length < maxCardCount" @create="$emit('create')" />
  </div>
</template>

<script setup lang="ts">
import { WeekDetails, WeekAddCard } from '@/features/week';
import type { UserWeekMinimal } from '@/domain/week/models';

withDefaults(
  defineProps<{
    weeks: UserWeekMinimal[];
    maxCardCount?: number;
  }>(),
  {
    maxCardCount: 6,
  },
);

defineEmits<{
  create: [];
  edit: [week: UserWeekMinimal];
  delete: [week: UserWeekMinimal];
}>();
</script>
