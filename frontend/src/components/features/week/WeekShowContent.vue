<template>
  <div class="content">
    <img :src="default_img" alt="Week Image" class="background" />
    <div class="gradient-layout"></div>
    <router-link :to="`/weeks/${props.week.id}`" class="absolute inset-0 z-20"></router-link>
    <h3>
      {{ week.name }}
    </h3>
    <div class="controls">
      <Button class="btn-circle" @click.stop="isEditModalOpen = true">
        <Icon icon="mdi:pencil" class="icon" />
      </Button>
      <Button class="btn-circle" @click.stop="isDeleteModalOpen = true">
        <Icon icon="mdi:trash-can-outline" class="icon" />
      </Button>
    </div>
  </div>
  <WeekEditModal
    v-model="isEditModalOpen"
    :week-name="week.name"
    :saving="isProcessing"
    @save="handleEdit"
    @close="isEditModalOpen = false"
  />
  <WeekDeleteModal
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
import WeekEditModal from '@/components/features/week/WeekEditModal.vue';
import WeekDeleteModal from '@/components/features/week/WeekDeleteModal.vue';
import { Icon } from '@iconify/vue';
import type { UserWeek } from '@/types/api';
import { useWeekStore } from '@/stores/weeks';

const props = defineProps<{ week: UserWeek }>();

const default_img = new URL('@/assets/week_bg.svg', import.meta.url).href;

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

<style scoped>
@import 'tailwindcss';

.content {
  @apply relative rounded-2xl overflow-hidden;

  .background {
    @apply w-full h-full object-cover object-center z-0;
  }

  .gradient-layout {
    @apply absolute inset-0 z-10 bg-linear-to-t from-brand-primary/50 via-brand-primary/10 to-transparent;
  }

  .controls {
    @apply absolute top-2 right-2 flex gap-2 z-40 pointer-events-auto;
  }

  h3 {
    @apply absolute bottom-2 w-full text-center text-2xl font-semibold z-30 pointer-events-none;
  }
}

.btn-circle {
  @apply p-2 rounded-full active:ring-1 bg-white/80 backdrop-blur;
}

.icon {
  @apply size-6 cursor-pointer;
}
</style>
