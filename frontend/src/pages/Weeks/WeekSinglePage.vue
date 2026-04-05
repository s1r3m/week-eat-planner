<template>
  <div>
    <div v-if="error" class="flex justify-center-safe">
      <div
        class="flex flex-col gap-6 items-center-safe border-10 border-muted w-full p-6 mt-6 rounded-xl text-muted-foreground"
      >
        <MessageCircleX :size="42" />
        <h2 class="text-lg">An error has occurred during loading</h2>
        <p>{{ error.message }}</p>
        <Button @click="refetch"> Try again</Button>
      </div>
    </div>

    <div v-else-if="week" class="space-y-6 m-6">
      <PageTitle :header="week.name" description="Plan your meal to each day">
        <template #controls>
          <Loader2 v-if="isLoading" class="animate-spin text-muted-foreground" :size="20" />
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useQuery } from '@pinia/colada';
import { getWeekQuery, type WeekFull } from '@/api/weeks';

import PageTitle from '@/components/shared/PageTitle.vue';
import MealSlotGrid from '@/features/mealSlot/components/MealSlotGrid.vue';
import { WeekDeleteDialog, WeekEditDialog } from '@/features/week';
import Button from '@/components/ui/button/Button.vue';
import { Loader2, MessageCircleX, Pen, Trash } from 'lucide-vue-next';

const route = useRoute();

const { data: week, isLoading, error, refetch } = useQuery(getWeekQuery(String(route.params.id)));

const editingWeek = ref<WeekFull | null>(null);
const deletingWeek = ref<WeekFull | null>(null);

const openEdit = (selectedWeek: WeekFull) => (editingWeek.value = selectedWeek);
const openDelete = (selectedWeek: WeekFull) => (deletingWeek.value = selectedWeek);
</script>
