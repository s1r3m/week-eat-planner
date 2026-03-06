<template>
  <div class="grid gap-9 lg:grid-cols-2 lg:gap-12 2xl:grid-cols-3 2xl:gap-24 px-6">
    <Card v-for="week in weekStore.weeks" :key="week.id" variant="week">
      <WeekDetails :week="week" @edit="$emit('edit', week)" @delete="$emit('delete', week)" />
    </Card>
    <Card v-if="weekStore.weeks.length < 6" variant="empty">
      <WeekAddCard @create="$emit('create')" />
    </Card>
  </div>
</template>

<script setup lang="ts">
import { useWeekStore, WeekDetails, WeekAddCard } from '@/features/week';
import { Card } from '@/components/ui/card';
import type { UserWeekMinimal } from '@/domain/week/models';

defineEmits<{
  create: [];
  edit: [week: UserWeekMinimal];
  delete: [week: UserWeekMinimal];
}>();

const weekStore = useWeekStore();
</script>
