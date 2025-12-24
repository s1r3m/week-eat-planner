<template>
  <img
    :src="default_img"
    alt="Week Image"
    loading="lazy"
    class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
  />

  <div class="flex absolute bottom-0 z-10 bg-primary/50 h-16 w-full items-center">
    <h3 class="pl-8 text-lg font-semibold text-white drop-shadow-md">
      {{ week.name }}
    </h3>
  </div>
  <router-link
    :to="{ name: 'week', params: { id: week.id } }"
    class="absolute inset-0 z-20"
  ></router-link>
  <div class="absolute bottom-0 left-0 p-4"></div>
  <div class="absolute top-2 right-2 flex gap-2 z-40 pointer-events-auto">
    <Button
      class="p-4 rounded-full cursor-pointer bg-primary/60 backdrop-blur-lg"
      @click.stop="isEditModalOpen = true"
    >
      <Pencil />
    </Button>
    <Button
      class="p-4 rounded-full cursor-pointer bg-primary/60 backdrop-blur-lg"
      @click.stop="isDeleteModalOpen = true"
    >
      <Trash2 />
    </Button>
  </div>
  <WeekEditDialog
    v-model="isEditModalOpen"
    :week-name="week.name"
    :saving="isProcessing"
    @save="handleEdit"
    @close="isEditModalOpen = false"
  />
  <WeekDeleteDialog
    v-model="isDeleteModalOpen"
    :week-name="week.name"
    :processing="isProcessing"
    @confirm="handleDelete"
    @close="isDeleteModalOpen = false"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import WeekEditDialog from '@/features/week/components/WeekEditDialog.vue';
import WeekDeleteDialog from '@/features/week/components/WeekDeleteDialog.vue';
import { Pencil, Trash2 } from 'lucide-vue-next';

import type { UserWeek } from '@/api/types/api';
import { useWeekStore } from '@/features/week/store/weeks';

const props = defineProps<{ week: UserWeek }>();

const default_img = new URL('@/assets/weeks/week-fallback.jpg', import.meta.url).href;

const isEditModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isProcessing = ref(false);
const weekStore = useWeekStore();

const handleEdit = async (newName: string) => {
  isProcessing.value = true;
  isEditModalOpen.value = false;
  try {
    await weekStore.updateWeek(props.week.id, newName);
  } finally {
    isProcessing.value = false;
  }
};

const handleDelete = async () => {
  isDeleteModalOpen.value = false;
  isProcessing.value = true;
  try {
    await weekStore.removeWeek(props.week.id);
  } finally {
    isProcessing.value = false;
  }
};
</script>
