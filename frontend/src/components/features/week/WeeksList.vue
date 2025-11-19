<template>
  <div>
    <Card
      v-for="week in weekStore.weeks"
      :key="week.id"
      :name="week.name"
      interactive
      @click="handleWeekClick(week.id)"
      @edit="handleEdit(week.id)"
      @delete="handleDelete(week.id)"
    />
    <form v-if="weekStore.weeks.length < 6" @submit.prevent="handleWeekCreate">
      <div>
        <label for="new-week-name"> Add a week: </label>
        <input
          id="new-week-name"
          v-model="newWeekName"
          name="new-week-name"
          type="text"
          placeholder="name"
        />
      </div>
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
