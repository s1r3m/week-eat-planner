<template>
  <div class="weeks-page-container">
    <div class="space-y-6 m-6">
      <PageTitle header="My Weeks" description="Manage your weekly meal plans here">
        <template #controls>
          <Button size="lg" @click="isCreateOpen = true">
            <Plus />
            <span class="hidden md:inline">Add a new week</span>
          </Button>
        </template>
      </PageTitle>

      <WeeksGrid :weeks="weekStore.weeks" @edit="openEdit" @delete="openDelete" />
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
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-vue-next';
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
