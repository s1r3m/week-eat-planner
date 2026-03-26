<template>
  <div class="weeks-page-container">
    <div class="space-y-6 m-6">
      <PageTitle header="My Weeks" description="Manage your weekly meal plans here" />
      <WeeksGrid
        :weeks="weekStore.weeks"
        @create="isCreateOpen = true"
        @edit="openEdit"
        @delete="openDelete"
      />
    </div>

    <WeekCreateDialog v-model="isCreateOpen" />
    <WeekEditDialog v-model="editingWeek" />
    <WeekDeleteDialog v-model="deletingWeek" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  useWeekStore,
  WeeksGrid,
  WeekCreateDialog,
  WeekEditDialog,
  WeekDeleteDialog,
} from '@/features/week';
import type { UserWeekMinimal } from '@/domain/week/models';

import PageTitle from '@/components/shared/PageTitle.vue';

const weekStore = useWeekStore();

const isCreateOpen = ref(false);
const editingWeek = ref<UserWeekMinimal | null>(null);
const deletingWeek = ref<UserWeekMinimal | null>(null);

const openEdit = (week: UserWeekMinimal) => (editingWeek.value = week);
const openDelete = (week: UserWeekMinimal) => (deletingWeek.value = week);

await weekStore.fetchWeeks();
</script>
