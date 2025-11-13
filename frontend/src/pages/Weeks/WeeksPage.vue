<script setup lang="ts">
import { useWeekStore } from '@/stores/weeks'
import TheError from '@/components/TheError.vue'
import TheWeeks from '@/components/TheWeeks.vue'
import { useRouter } from 'vue-router'

const weekStore = useWeekStore()
const router = useRouter()

try {
  await weekStore.fetchWeeks()
} catch (err: any) {
  // If unauthorized, redirect user to login so they can re-authenticate.
  if (err?.response?.status === 401) {
    router.push({ name: 'login', query: { redirect: '/weeks' } })
  }
}
</script>

<template>
  <div class="weeks">
    <TheError />
    <TheWeeks />
  </div>
</template>

<style scoped>

</style>
