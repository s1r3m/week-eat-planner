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
import { useMutation } from '@pinia/colada';
import { editWeekMutation } from '@/api/weeks';
import type { WeekPreview } from '@/api/weeks';

import WeekFormDialog from '@/features/week/components/WeekFormDialog.vue';

const week = defineModel<WeekPreview | null>();

const isOpen = computed({
  get: () => !!week.value,
  set: (value) => {
    if (!value) week.value = null;
  },
});

const { mutate: edit, isLoading } = useMutation(editWeekMutation());

const onEdit = (name: string) => {
  if (!week.value) return;
  edit({ id: week.value.id, payload: { name } });
  week.value = null;
};
</script>
