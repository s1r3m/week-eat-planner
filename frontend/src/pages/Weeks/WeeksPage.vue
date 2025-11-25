<template>
  <div class="grid-contianer justify-items-center gap-8">
    <PresentCard
      v-for="week in weekStore.weeks"
      :key="week.id"
      :name="week.name"
      class="grid-item"
      @click="router.push(`/weeks/${week.id}`)"
      @edit="openEditModal(week.id)"
      @delete="openDeleteModal(week.id)"
    />
    <PresentCard
      v-if="weekStore.weeks.length < 9"
      variant="addWeek"
      class="grid-item"
      @create-week="openAddModal"
    />
  </div>

  <WeekEditModal
    v-model="isEditModalOpen"
    :week-name="selectedWeekName"
    :saving="isProcessing"
    @save="handleEdit"
    @close="handleEditClose"
  />
  <WeekDeleteModal
    v-model="isDeleteModalOpen"
    :week-name="selectedWeekName"
    :processing="isProcessing"
    @confirm="handleDelete"
    @close="handleDeleteClose"
  />
  <WeekAddModal
    v-model="isAddWeekModalOpen"
    :processing="isProcessing"
    @create="handleCreateWeek"
    @close="handleAddClose"
  />
</template>

<script setup lang="ts">
import type { UserWeek } from '@/types/api';
import type { WeekPayload } from '@/types/week';

import { ref, computed } from 'vue';
import { useWeekStore } from '@/stores/weeks';
import { useRouter } from 'vue-router';

import PresentCard from '@/components/ui/PresentCard.vue';
import WeekEditModal from '@/components/features/week/WeekEditModal.vue';
import WeekDeleteModal from '@/components/features/week/WeekDeleteModal.vue';
import WeekAddModal from '@/components/features/week/WeekAddModal.vue';

const router = useRouter();
const weekStore = useWeekStore();
await weekStore.fetchWeeks();

const selectedWeek = ref<UserWeek | null>(null);
const selectedWeekName = computed(() => selectedWeek?.value?.name ?? '');

const isEditModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isAddWeekModalOpen = ref(false);
const isProcessing = ref(false);

const handleEdit = async (newName: string) => {
  const week = selectedWeek.value;
  if (week) {
    isProcessing.value = true;
    handleEditClose();
    try {
      await weekStore.updateWeek(week.id, newName);
    } finally {
      isProcessing.value = false;
    }
  } else {
    console.error('Attempting to edit null week!');
  }
};

const handleDelete = async () => {
  const week = selectedWeek.value;
  if (week) {
    console.log('Deleted week:', week);
    handleDeleteClose();
    isProcessing.value = true;
    try {
      await weekStore.removeWeek(week.id);
    } finally {
      isProcessing.value = false;
    }
  } else {
    console.error('Attempting to delete null week!');
  }
};

const handleCreateWeek = async (weekData: WeekPayload) => {
  try {
    handleAddClose();
    isProcessing.value = true;
    await weekStore.addWeek(weekData.name);
  } finally {
    isProcessing.value = false;
  }
};

// Modal handlers.
const openEditModal = (weekId: string) => {
  isEditModalOpen.value = true;
  selectedWeek.value = weekStore.weeks.find((week) => week.id === weekId) as UserWeek;
};
const handleEditClose = () => {
  isEditModalOpen.value = false;
  selectedWeek.value = null;
};
const openDeleteModal = (weekId: string) => {
  isDeleteModalOpen.value = true;
  selectedWeek.value = weekStore.weeks.find((week) => week.id === weekId) as UserWeek;
};
const handleDeleteClose = () => {
  isDeleteModalOpen.value = false;
  selectedWeek.value = null;
};
const openAddModal = () => (isAddWeekModalOpen.value = true);
const handleAddClose = () => (isAddWeekModalOpen.value = false);
</script>

<style scoped>
@import 'tailwindcss';
@import '@/theme.css';

.grid-contianer {
  @apply grid grid-cols-1 2xl:grid-cols-3 lg:grid-cols-2;
}

.grid-item {
  @apply max-h-80;
}
</style>
