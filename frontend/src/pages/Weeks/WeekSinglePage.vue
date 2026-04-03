<template>
  <div v-if="week" class="space-y-6 m-6">
    <PageTitle :header="week.name" description="Plan your meal to each day">
      <template #controls>
        <Button variant="destructiveOutline" size="lg" @click="onDelete">
          <Trash /><span class="hidden md:inline"> Delete </span>
        </Button>
      </template>
    </PageTitle>
    <MealSlotGrid :week-days="week.week_days" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PageTitle from '@/components/shared/PageTitle.vue';
import MealSlotGrid from '@/features/mealSlot/components/MealSlotGrid.vue';

import { useRoute, useRouter } from 'vue-router';
import { useWeekStore } from '@/features/week';
import { useAsyncCall } from '@/composables/useAsyncCall';
import Button from '@/components/ui/button/Button.vue';
import { ROUTE_NAMES } from '@/domain/router/routeNames';
import { Trash } from 'lucide-vue-next';

const weekStore = useWeekStore();
const route = useRoute();
const router = useRouter();

const { call: getWeek } = useAsyncCall(async (weekId: string) => weekStore.getWeek(weekId));
const data = await getWeek(String(route.params.id));
const week = ref(data);

const { call: deleteWeek } = useAsyncCall((weekId: string) => weekStore.removeWeek(weekId));
const onDelete = () => {
  if (!week.value) return;
  deleteWeek(week.value.id);
  router.push({ name: ROUTE_NAMES.WEEKS });
};
</script>
