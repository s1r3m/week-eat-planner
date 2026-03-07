<template>
  <WeekFormDialog
    v-if="week"
    v-model="isOpen"
    :title="`Edit ${week.name}`"
    description="Update the name so the plan stays organized."
    :initial-name="week.name"
    submit-label="Save"
    :is-loading="isLoading"
    @submit="onEdit"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAsyncCall } from '@/features/auth/composables/useAsyncCall';
import { useWeekStore } from '../store/weeks';
import type { UserWeekMinimal } from '@/domain/week/models';
import WeekFormDialog from '@/features/week/components/WeekFormDialog.vue';

const week = defineModel<UserWeekMinimal | null>();

const isOpen = computed({
  get: () => !!week.value,
  set: (value) => {
    if (!value) week.value = null;
  },
});

const weekStore = useWeekStore();
const { call: edit, isLoading } = useAsyncCall(async (week: UserWeekMinimal, newName: string) => {
  await weekStore.updateWeek(week.id, newName);
});

const onEdit = async (name: string) => {
  if (!week.value) return;
  await edit(week.value, name);
  week.value = null;
};
</script>
