<template>
  <div class="grid gap-9 lg:grid-cols-2 lg:gap-12 2xl:grid-cols-3 2xl:gap-24 px-6">
    <WeekDetails
      v-for="week in weekStore.weeks"
      :week="week"
      @edit="$emit('edit', week)"
      @delete="$emit('delete', week)"
    />
    <WeekAddCard v-if="weekStore.weeks.length < maxCardCount" @create="$emit('create')" />
  </div>
</template>

<script setup lang="ts">
import { useWeekStore, WeekDetails, WeekAddCard } from '@/features/week';
import type { UserWeekMinimal } from '@/domain/week/models';

const { maxCardCount = 6 } = defineProps<{
  maxCardCount?: number;
}>();

defineEmits<{
  create: [];
  edit: [week: UserWeekMinimal];
  delete: [week: UserWeekMinimal];
}>();

const weekStore = useWeekStore();
</script>
