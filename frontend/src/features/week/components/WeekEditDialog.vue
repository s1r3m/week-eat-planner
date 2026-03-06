<template>
  <WeekFormDialog
    v-model:open="isOpen"
    :title="`Edit ${week.name}`"
    description="Update the name so the plan stays organized."
    :initial-name="week.name"
    submit-label="Save"
    :is-loading="isLoading"
    @submit="onEdit"
  />
</template>

<script setup lang="ts">
import { useAsyncCall } from '@/features/auth/composables/useAsyncCall';
import { useWeekStore } from '../store/weeks';
import type { UserWeekMinimal } from '@/domain/week/models';
import WeekFormDialog from '@/features/week/components/WeekFormDialog.vue';

const isOpen = defineModel<boolean>();
const props = defineProps<{ week: UserWeekMinimal }>();

const weekStore = useWeekStore();
const { call: edit, isLoading } = useAsyncCall(async (newName: string) => {
  await weekStore.updateWeek(props.week.id, newName);
});

const onEdit = async (name: string) => {
  await edit(name);
  isOpen.value = false;
};
</script>
