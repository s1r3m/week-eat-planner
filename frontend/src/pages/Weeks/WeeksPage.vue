<template>
  <TheMainLayout>
    <template #header>
      <h2 class="text-3xl font-bold">My Weeks from page</h2>
      <p class="text-gray-600">Manage weekly meal plans</p>
    </template>

    <Suspense>
      <template #default>
        <WeeksList :weeks="weekStore.weeks"/>
      </template>

      <template #fallback>
        <div class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p class="text-gray-600">Loading weeks...</p>
          </div>
        </div>
      </template>
    </Suspense>
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
