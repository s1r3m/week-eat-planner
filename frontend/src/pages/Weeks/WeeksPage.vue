<template>
  <div class="weeks-page-container">
    <div class="space-y-9 mb-9">
      <PageTitle header="My Weeks" description="Manage your weekly meal plans here" />
      <WeeksGrid
        :weeks="weekStore.weeks"
        @create="isCreateOpen = true"
        @edit="openEdit"
        @delete="openDelete"
      />
    </div>

    <!-- Dialogs -->
    <WeekCreateDialog v-model:open="isCreateOpen" />
    <WeekEditDialog v-if="selectedWeek" v-model:open="isEditOpen" :week="selectedWeek" />
    <WeekDeleteDialog v-if="selectedWeek" v-model:open="isDeleteOpen" :week="selectedWeek" />
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
const isEditOpen = ref(false);
const isDeleteOpen = ref(false);
const selectedWeek = ref<UserWeekMinimal | null>(null);

const openEdit = (week: UserWeekMinimal) => {
  selectedWeek.value = week;
  isEditOpen.value = true;
};

const openDelete = (week: UserWeekMinimal) => {
  selectedWeek.value = week;
  isDeleteOpen.value = true;
};

await weekStore.fetchWeeks();
</script>
