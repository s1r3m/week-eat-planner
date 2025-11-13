<script setup lang="ts">
import { useWeekStore } from '@/stores/weeks'
import TheError from '@/components/ErrorNotification.vue'
import TheWeeks from '@/components/WeeksList.vue'

const weekStore = useWeekStore()
await weekStore.fetchWeeks()
</script>

<template>
  <div class="weeks">
    <TheError />
    <TheWeeks />
  </div>
</template>

<style scoped>

</style>
