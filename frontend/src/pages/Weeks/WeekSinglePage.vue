<template>
  <div v-if="week" class="space-y-6 m-6">
    <PageTitle :header="week.name" description="Plan your meal to each day">
      <template #controls>
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
    <MealSlotGrid :week-days="week.week_days" />

    <WeekEditDialog v-model="editingWeek" />
    <WeekDeleteDialog v-model="deletingWeek" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PageTitle from '@/components/shared/PageTitle.vue';
import MealSlotGrid from '@/features/mealSlot/components/MealSlotGrid.vue';

import { useRoute } from 'vue-router';
import { useWeekStore, WeekDeleteDialog, WeekEditDialog } from '@/features/week';
import { useAsyncCall } from '@/composables/useAsyncCall';
import Button from '@/components/ui/button/Button.vue';
import { Pen, Trash } from 'lucide-vue-next';
import type { UserWeekMinimal } from '@/domain/week/models';

const weekStore = useWeekStore();
const route = useRoute();

const { call: getWeek } = useAsyncCall(async (weekId: string) => weekStore.getWeek(weekId));
const data = await getWeek(String(route.params.id));
const week = ref(data);

const editingWeek = ref<UserWeekMinimal | null>(null);
const deletingWeek = ref<UserWeekMinimal | null>(null);

const openEdit = (week: UserWeekMinimal) => (editingWeek.value = week);
const openDelete = (week: UserWeekMinimal) => (deletingWeek.value = week);
</script>
