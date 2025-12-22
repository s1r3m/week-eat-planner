<template>
  <div
    class="border-primary border-dashed border-4 rounded-2xl w-full h-full flex items-center justify-center cursor-pointer hover:bg-accent/50 transition"
    @click.stop="isAddWeekModalOpen = true"
  >
    <span class="text-9xl font-bold text-primary">+</span>
  </div>

  <WeekCreateDialog
    v-model="isAddWeekModalOpen"
    :processing="isProcessing"
    @create="handleCreateWeek"
    @close="isAddWeekModalOpen = false"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import WeekCreateDialog from '@/features/week/components/WeekCreateDialog.vue';
import { useWeekStore } from '@/features/week/store/weeks';
import type { WeekPayload } from '@/features/week/types/week';

const isProcessing = ref(false);
const isAddWeekModalOpen = ref(false);
const weekStore = useWeekStore();

const handleCreateWeek = async (weekData: WeekPayload) => {
  isProcessing.value = true;
  isAddWeekModalOpen.value = false;
  // TODO: Add error handling.  <img src="@/assets/add_week_bg_1.png" alt="Week Image" />
  try {
    await weekStore.addWeek(weekData.name);
  } finally {
    isProcessing.value = false;
  }
};
</script>
