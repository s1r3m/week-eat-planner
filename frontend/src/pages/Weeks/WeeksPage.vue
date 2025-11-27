<template>
  <div class="grid-container justify-items-center gap-8">
    <PresentCard v-for="week in weekStore.weeks" :key="week.id" class="grid-item">
      <WeekShowContent
        :week="week"
        @edit="openEditModal(week.id)"
        @delete="openDeleteModal(week.id)"
      />
    </PresentCard>
    <PresentCard v-if="weekStore.weeks.length < 6" class="grid-item">
      <WeekAddContent @create-week="openAddModal" />
    </PresentCard>
  </div>

  <WeekEditModal
    v-model="isEditModalOpen"
    :week-name="selectedWeekName"
    :saving="isProcessing"
    @save="handleEdit"
    @close="closeEditModal"
  />
  <WeekDeleteModal
    v-model="isDeleteModalOpen"
    :week-name="selectedWeekName"
    :processing="isProcessing"
    @confirm="handleDelete"
    @close="closeDeleteModal"
  />
  <WeekAddModal
    v-model="isAddWeekModalOpen"
    :processing="isProcessing"
    @create="handleCreateWeek"
    @close="closeAddModal"
  />
</template>

<script setup lang="ts">
import type { UserWeek } from '@/types/api';
import type { WeekPayload } from '@/types/week';

import { ref, computed } from 'vue';
import { useWeekStore } from '@/stores/weeks';

import PresentCard from '@/components/ui/PresentCard.vue';
import WeekEditModal from '@/components/features/week/WeekEditModal.vue';
import WeekDeleteModal from '@/components/features/week/WeekDeleteModal.vue';
import WeekAddModal from '@/components/features/week/WeekAddModal.vue';
import WeekShowContent from '@/components/features/week/WeekShowContent.vue';
import WeekAddContent from '@/components/features/week/WeekAddContent.vue';

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
    closeEditModal();
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
    closeDeleteModal();
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
    closeAddModal();
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
const closeEditModal = () => {
  isEditModalOpen.value = false;
  selectedWeek.value = null;
};
const openDeleteModal = (weekId: string) => {
  isDeleteModalOpen.value = true;
  selectedWeek.value = weekStore.weeks.find((week) => week.id === weekId) as UserWeek;
};
const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
  selectedWeek.value = null;
};
const openAddModal = () => (isAddWeekModalOpen.value = true);
const closeAddModal = () => (isAddWeekModalOpen.value = false);
</script>

<style scoped>
@import 'tailwindcss';
@import '@/theme.css';

.grid-container {
  @apply grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3;
}

.grid-item {
  @apply max-h-80;
}
</style>
