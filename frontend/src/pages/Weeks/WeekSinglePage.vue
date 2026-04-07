<template>
  <div id="week-container" class="space-y-6 m-6">
    <PageTitle :header="week?.name" description="Plan your meal to each day">
      <template v-if="!isLoading" #controls>
        <Button variant="outline" size="lg" aria-label="Edit week" @click="openEdit(week)"
          ><Pen /> <span class="hidden md:inline"> Edit </span></Button
        >
        <Button
          variant="destructiveOutline"
          size="lg"
          aria-label="Delete week"
          @click="openDelete(week)"
        >
          <Trash /><span class="hidden md:inline"> Delete </span>
        </Button>
      </template>
    </PageTitle>

    <ErrorRetryCard v-if="error" :err="error" :retry="refetch" />
    <MealSlotGrid v-else-if="week" :week-days="week.week_days" />
    <TheLoadingPageState v-else-if="isLoading" />

    <WeekEditDialog v-model="editingWeek" />
    <WeekDeleteDialog v-model="deletingWeek" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useQuery } from '@pinia/colada';
import { getWeekQuery } from '@/api/weeks';
import type { WeekPreview } from '@/api/weeks';

import PageTitle from '@/components/shared/PageTitle.vue';
import MealSlotGrid from '@/features/mealSlot/components/MealSlotGrid.vue';
import { WeekDeleteDialog, WeekEditDialog } from '@/features/week';
import Button from '@/components/ui/button/Button.vue';
import { Pen, Trash } from 'lucide-vue-next';
import TheLoadingPageState from '@/layouts/components/TheLoadingPageState.vue';
import ErrorRetryCard from '@/components/shared/ErrorRetryCard.vue';

const route = useRoute();

const {
  data: week,
  isLoading,
  error,
  refetch,
} = useQuery(() => getWeekQuery(String(route.params.id)));

const editingWeek = ref<WeekPreview | null>(null);
const deletingWeek = ref<WeekPreview | null>(null);
const openEdit = (selectedWeek?: WeekPreview) => {
  if (selectedWeek) editingWeek.value = selectedWeek;
};
const openDelete = (selectedWeek?: WeekPreview) => {
  if (selectedWeek) deletingWeek.value = selectedWeek;
};
</script>
