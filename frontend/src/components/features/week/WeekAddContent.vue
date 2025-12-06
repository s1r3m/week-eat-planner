<template>
  <div @click.stop="isAddWeekModalOpen = true">
    <img src="@/assets/add_week_bg_1.png" alt="Week Image" />
  </div>
  <WeekAddModal
    v-model="isAddWeekModalOpen"
    :processing="isProcessing"
    @create="handleCreateWeek"
    @close="isAddWeekModalOpen = false"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import WeekAddModal from '@/components/features/week/WeekAddModal.vue';
import { useWeekStore } from '@/stores/weeks';
import type { WeekPayload } from '@/types/week';

const isProcessing = ref(false);
const isAddWeekModalOpen = ref(false);
const weekStore = useWeekStore();

const handleCreateWeek = async (weekData: WeekPayload) => {
  isProcessing.value = true;
  isAddWeekModalOpen.value = false;
  // TODO: Add error handling.
  try {
    await weekStore.addWeek(weekData.name);
  } finally {
    isProcessing.value = false;
  }
};
</script>
