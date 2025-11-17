<template>
  <h2>My Weeks</h2>
  <WeeksList />
</template>

<script setup lang="ts">
import { useWeekStore } from '@/stores/weeks'
import WeeksList from '@/components/features/week/WeeksList.vue'

const weekStore = useWeekStore()
await weekStore.fetchWeeks()
</script>

<style scoped>

</style>
