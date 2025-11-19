<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3 lg:gap-8">
    <Card
      v-for="week in weekStore.weeks"
      :key="week.id"
      :name="week.name"
      interactive
      @click="handleWeekClick(week.id)"
      @edit="handleEdit(week.id)"
      @delete="handleDelete(week.id)"
    />
    <form
      v-if="weekStore.weeks.length < 6"
      class="h-full w-full"
      @submit.prevent="handleWeekCreate"
    >
      <Card :interactive="false" :show-overlay="false">
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
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Card from '@/components/ui/Card.vue';
import { useWeekStore } from '@/stores/weeks';

const router = useRouter();
const newWeekName = ref('');
const weekStore = useWeekStore();

const handleWeekClick = (weekId: string) => {
  router.push(`/weeks/${weekId}`);
};

const handleWeekCreate = async () => {
  if (newWeekName.value.trim()) {
    console.log('Creating week:', newWeekName.value);
    await weekStore.addWeek(newWeekName.value);
    newWeekName.value = '';
  }
};

const handleEdit = async (weekId: string) => {
  console.log('Editing the week: ', weekId);
  const week = await weekStore.getWeek(weekId);
  console.log('Week:', week);
};

const handleDelete = async (weekId: string) => {
  console.log('Deleting the week: ', weekId);
  await weekStore.removeWeek(weekId);
};
</script>

<style scoped></style>
