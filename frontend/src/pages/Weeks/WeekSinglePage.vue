<template>
  <div id="week-container" class="space-y-6 m-6">
    <PageTitle :header="week?.name" description="Plan your meal to each day">
      <template v-if="!isLoading" #controls>
        <Button
          v-if="week"
          variant="outline"
          size="default"
          class="md:h-11 md:px-7 md:text-title-sm"
          aria-label="Edit week"
          @click="editingWeek = week"
          ><Pen /> <span class="hidden md:inline"> Edit </span></Button
        >
        <Button
          v-if="week"
          variant="destructiveOutline"
          size="default"
          class="md:h-11 md:px-7 md:text-title-sm"
          aria-label="Delete week"
          @click="deletingWeek = week"
        >
          <Trash /><span class="hidden md:inline"> Delete </span>
        </Button>
      </template>
    </PageTitle>

    <ErrorRetryCard v-if="error" :error="error" :retry="refetch" />
    <MealSlotGrid
      v-else-if="week"
      :week-days="week.week_days"
      @select-slot="selectedSlot = $event"
    />
    <TheLoadingPageState v-else-if="isLoading" />

    <WeekEditDialog v-model="editingWeek" />
    <WeekDeleteDialog v-model="deletingWeek" />
    <MealSlotAssignRecipeDialog v-if="week" v-model="selectedSlot" :week-id="week.id" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useQuery } from '@pinia/colada';
import { getWeekQuery } from '@/api/weeks';
import type { WeekPreview, MealSlot } from '@/api/weeks';

import PageTitle from '@/components/shared/PageTitle.vue';
import MealSlotGrid from '@/features/mealSlot/components/MealSlotGrid.vue';
import MealSlotAssignRecipeDialog from '@/features/mealSlot/components/MealSlotAssignRecipeDialog.vue';
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
const selectedSlot = ref<MealSlot | null>(null);
</script>
