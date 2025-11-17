<script setup lang="ts">
import { ref } from 'vue';
import type { Ref } from 'vue';
import type { UserWeek } from '@/types/api';
import { useRoute, useRouter } from 'vue-router';
import { useWeekStore } from '@/stores/weeks';

const week: Ref<UserWeek | null> = ref(null);
const weekStore = useWeekStore();
const route = useRoute();
const router = useRouter();

week.value = await weekStore.getWeek(route.params.id as string);
if (!week.value) {
  router.push('/weeks');
}
</script>

<template>
  <div v-if="week" class="week-container">
    <h2>{{ week.name }}</h2>
    <div class="meal_slots-container">
      <p v-for="meal_slot in week.meal_slots" :key="meal_slot.id">
        {{ meal_slot.meal_type }} - {{ meal_slot.day_of_week }} -- {{ meal_slot.id }}
        <span v-if="meal_slot.recipe_id">Recipe: {{ meal_slot.recipe_id }}</span>
      </p>
    </div>
  </div>
</template>

<style scoped></style>
