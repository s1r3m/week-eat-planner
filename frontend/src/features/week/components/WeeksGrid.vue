<template>
  <div class="grid gap-9 md:grid-cols-2 lg:grid-cols-3 lg:gap-12 2xl:grid-cols-4 2xl:gap-24 px-6">
    <WeekDetails
      v-for="week in weeks"
      :key="week.id"
      :week="week"
      @edit="$emit('edit', week)"
      @delete="$emit('delete', week)"
    />
    <AppAddCard v-if="weeks.length < maxCardCount" @create="$emit('create')" />
  </div>
</template>

<script setup lang="ts">
import { WeekDetails } from '@/features/week';
import AppAddCard from '@/components/shared/AppAddCard.vue';
import type { UserWeekMinimal } from '@/domain/week/models';

withDefaults(
  defineProps<{
    weeks: UserWeekMinimal[];
    maxCardCount?: number;
  }>(),
  {
    maxCardCount: 8,
  },
);

defineEmits<{
  create: [];
  edit: [week: UserWeekMinimal];
  delete: [week: UserWeekMinimal];
}>();
</script>
