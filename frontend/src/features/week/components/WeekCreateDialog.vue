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
import { useAsyncCall } from '@/composables/useAsyncCall';
import { useWeekStore } from '@/features/week/store/weeks';
import WeekFormDialog from '@/features/week/components/WeekFormDialog.vue';

const isOpen = defineModel<boolean>();

const weekStore = useWeekStore();
const { call: create, isLoading } = useAsyncCall(async (name: string) => {
  await weekStore.addWeek(name);
});

const onCreate = async (name: string) => {
  await create(name);
  isOpen.value = false;
};
</script>
