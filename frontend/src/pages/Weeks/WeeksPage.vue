<template>
  <div class="grid-contianer justify-items-center gap-8">
    <PresentCard
      v-for="week in weekStore.weeks"
      :key="week.id"
      :name="week.name"
      @click="router.push(`/weeks/${week.id}`)"
      @edit="openEditModal(week.id)"
      @delete="openDeleteModal(week.id)"
    />
    <PresentCard
      v-if="weekStore.weeks.length < 6"
      variant="addWeek"
      @create-week="handleCreateWeek"
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
</template>

<script setup lang="ts">
import type { UserWeek } from '@/types/api';

import { ref, computed } from 'vue';
import { useWeekStore } from '@/stores/weeks';
import { useRouter } from 'vue-router';

import PresentCard from '@/components/ui/PresentCard.vue';
import WeekEditModal from '@/components/features/week/WeekEditModal.vue';
import WeekDeleteModal from '@/components/features/week/WeekDeleteModal.vue';

const router = useRouter();
const weekStore = useWeekStore();
await weekStore.fetchWeeks();

const selectedWeek = ref<UserWeek | null>(null);
const selectedWeekName = computed(() => selectedWeek?.value?.name ?? '');

const isEditModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isProcessing = ref(false);

const handleEdit = async (newName: string) => {
  const week = selectedWeek.value;
  if (week) {
    console.log('Editing week:', week.id, newName);
    isProcessing.value = true;
    try {
      await weekStore.updateWeek(week.id, newName);
      handleEditClose();
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
    isProcessing.value = true;
    try {
      await weekStore.removeWeek(week.id);
      handleDeleteClose();
    } finally {
      isProcessing.value = false;
    }
  } else {
    console.error('Attempting to delete null week!');
  }
};

const handleCreateWeek = async (weekName: string) => {
  try {
    isProcessing.value = true;
    await weekStore.addWeek(weekName);
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
</script>

<style scoped>
@import 'tailwindcss';
@import '@/theme.css';

.grid-contianer {
  @apply grid grid-cols-1 2xl:grid-cols-3 lg:grid-cols-2;
}

.grid-item {
  display: grid;
  place-items: end;
  @apply rounded-2xl shadow-lg hover:shadow-xl hover:border hover:-m-px  hover:border-brand-primary transition-shadow duration-300 max-h-80;
}

.grid-item img {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  border-radius: 1rem;
}

.grid-item h3 {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  width: 100%;
}

.grid-item .controls {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  place-self: start end;
}

.grid-item button {
  @apply rounded-full active:ring-1 p-2 m-2;
}

.gradient-layout {
  @apply rounded-2xl bg-linear-to-t from-brand-primary/50 via-brand-primary/10 to-transparent w-full h-full cursor-pointer;
  grid-column: 1 / 2;
  grid-row: 1 / 2;
}
</style>
