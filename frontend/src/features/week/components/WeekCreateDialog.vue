<template>
  <WeekFormDialog
    v-model="isOpen"
    title="Add new Week"
    description="Fill the following form:"
    initial-name=""
    submit-label="Create"
    :is-loading="isLoading"
    @submit="onCreate"
  />
</template>

<script setup lang="ts">
import { addWeekMutation } from '@/api/weeks';
import { useMutation } from '@pinia/colada';

import WeekFormDialog from '@/features/week/components/WeekFormDialog.vue';

const isOpen = defineModel<boolean>();

const { mutate: createWeek, isLoading } = useMutation(addWeekMutation());

const onCreate = async (name: string) => {
  createWeek({ name });
  isOpen.value = false;
};
</script>
