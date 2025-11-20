<template>
  <section class="space-y-0">
    <div
      class="grid grid-cols-1 justify-items-center gap-8 lg:grid-cols-2 2xl:grid-cols-3 lg:gap-x-8 lg:gap-y-16"
    >
      <Card
        v-for="week in weekStore.weeks"
        :key="week.id"
        :name="week.name"
        interactive
        class="w-full max-w-xl mx-auto"
        @click="handleWeekClick(week.id)"
        @edit="handleEdit(week.id)"
        @delete="handleDelete(week.id)"
      />
      <form
        v-if="weekStore.weeks.length < 6"
        class="h-full w-full max-w-xl justify-self-center mx-auto"
        @submit.prevent="handleWeekCreate"
      >
        <Card :interactive="false" :show-overlay="false" class="w-full max-w-xl mx-auto">
          <template #default>
            <div class="flex h-full w-full flex-col items-center justify-center gap-4">
              <button
                type="submit"
                aria-label="Create a week"
                class="text-7xl font-black leading-none text-brand-primary transition hover:text-brand-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              >
                +
              </button>
              <label class="sr-only" for="new-week-name">Week name</label>
              <input
                id="new-week-name"
                v-model="newWeekName"
                name="new-week-name"
                type="text"
                placeholder="Week name"
                class="w-full max-w-48 rounded-2xl border border-brand-muted bg-white px-4 py-2 text-center text-base text-base-color focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
              />
            </div>
          </template>
        </Card>
      </form>
    </div>

    <WeekEditModal
      v-model="isEditModalOpen"
      :week-name="selectedWeekName"
      :saving="isSavingWeek"
      @save="handleWeekSave"
      @close="closeEditModal"
    />
    <WeekDeleteModal
      v-model="isDeleteModalOpen"
      :week-name="selectedWeekName"
      :processing="isDeletingWeek"
      @confirm="handleDeleteConfirm"
      @cancel="closeDeleteModal"
      @close="closeDeleteModal"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import Card from '@/components/ui/Card.vue';
import WeekEditModal from '@/components/features/week/WeekEditModal.vue';
import WeekDeleteModal from '@/components/features/week/WeekDeleteModal.vue';
import { useWeekStore } from '@/stores/weeks';
import type { UserWeek } from '@/types/api';

const router = useRouter();
const newWeekName = ref('');
const weekStore = useWeekStore();
const selectedWeek = ref<UserWeek | null>(null);
const isEditModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isSavingWeek = ref(false);
const isDeletingWeek = ref(false);

const selectedWeekName = computed(() => selectedWeek.value?.name ?? '');

const handleWeekClick = (weekId: string) => {
  router.push(`/weeks/${weekId}`);
};

const handleWeekCreate = async () => {
  if (!newWeekName.value.trim()) {
    return;
  }
  await weekStore.addWeek(newWeekName.value);
  newWeekName.value = '';
};

const handleEdit = async (weekId: string) => {
  const week = await weekStore.getWeek(weekId);
  if (week) {
    selectedWeek.value = week;
    isEditModalOpen.value = true;
  }
};

const handleDelete = async (weekId: string) => {
  const week =
    weekStore.weeks.find((item) => item.id === weekId) || (await weekStore.getWeek(weekId));
  if (week) {
    selectedWeek.value = week;
    isDeleteModalOpen.value = true;
  }
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  if (!isDeleteModalOpen.value) {
    selectedWeek.value = null;
  }
};

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
  if (!isEditModalOpen.value) {
    selectedWeek.value = null;
  }
};

const handleWeekSave = async (updatedName: string) => {
  if (!selectedWeek.value) {
    return;
  }
  isSavingWeek.value = true;
  try {
    const updatedWeek = await weekStore.updateWeek(selectedWeek.value.id, updatedName);
    if (updatedWeek) {
      isEditModalOpen.value = false;
      selectedWeek.value = null;
    }
  } finally {
    isSavingWeek.value = false;
  }
};

const handleDeleteConfirm = async () => {
  if (!selectedWeek.value) {
    return;
  }
  isDeletingWeek.value = true;
  try {
    await weekStore.removeWeek(selectedWeek.value.id);
    isDeleteModalOpen.value = false;
    selectedWeek.value = null;
  } finally {
    isDeletingWeek.value = false;
  }
};
</script>

<style scoped></style>
