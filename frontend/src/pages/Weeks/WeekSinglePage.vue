<script setup lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'
import type { UserWeek } from '@/types/api'
import { useRoute, useRouter } from 'vue-router'
import apiClient from "@/api/client";

const week: Ref<UserWeek | null>  = ref(null)
const error = ref('')
const route = useRoute()
const router = useRouter()

const fetchWeek = async () => {
  error.value = ''
  const week_id = route.params.id as string

  try {
    const res = await apiClient.get(`/weeks/${week_id}`)
    week.value = res.data
  } catch (err: any) {
    error.value = err.message
    router.push('/weeks')
  }
}

await fetchWeek()
</script>

<template>
  <div v-if='week' class="week-container">
    <h2>{{ week.name }}</h2>
    <div class="meal_slots-container">
      <p v-for="meal_slot in week.meal_slots" :key="week.id">
        {{ meal_slot }}
      </p>
    </div>
  </div>
</template>

<style scoped>

</style>
