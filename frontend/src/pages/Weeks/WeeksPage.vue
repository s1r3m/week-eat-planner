<template>
  <TheMainLayout pageName="weeks">
    <template #header>
      <h2 class="text-3xl font-bold">My Weeks from page</h2>
      <p class="text-gray-600">Manage weekly meal plans</p>
    </template>

    <WeeksList />
  </TheMainLayout>
</template>

<script setup lang="ts">
import { useWeekStore } from '@/stores/weeks'
import WeeksList from '@/components/features/week/WeeksList.vue'
import TheMainLayout from '@/components/layout/TheMainLayout.vue'

const weekStore = useWeekStore()
await weekStore.fetchWeeks()
</script>

<style scoped>

</style>
