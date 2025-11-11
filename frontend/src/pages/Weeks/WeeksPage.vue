<script setup lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from "@/api/client"
import type { UserWeek } from '@/types/api'

const weeks: Ref<Array<UserWeek>> = ref([])
const error = ref('')
const newWeekName = ref('')
const router = useRouter()

const fetchWeeks = async () => {
  error.value = ''
  try {
    const res = await apiClient.get('/weeks')
    weeks.value = res.data
  }
  catch (err: any) {
    error.value = err.message
    router.push('/login')
  }
}

await fetchWeeks()

const createWeek = async () => {
  error.value = ''
  try {
    const res = await apiClient.post('/weeks', {
      name: newWeekName.value
    })

    weeks.value.push(res.data)
    newWeekName.value = ''
  } catch (err: any) {
    error.value = err.message
  }
}

const deleteWeek = async (week_id: string) => {
  error.value = ''
  try {
    const res = await apiClient.delete(`weeks/${week_id}`)
    if (res.status !== 204) {
      throw new Error(res.data || 'An unknown error occurred.')
    }
    weeks.value = weeks.value.filter(w => w.id !== week_id)
  } catch (err: any) {
    error.value = err.message
  }
}
</script>

<template>
  <div class="weeks">
    <h2>Your weeks</h2>
    <div>
      <p>Weeks count: {{ weeks.length }}</p>
      <div v-for="{id, name} in weeks" :key="id" class="week-container">
        <span>
          {{ name }}
        </span>
        <button class="btn" @click="router.push(`/weeks/${id}`)" >See week</button>
        <button class="btn btn-primary" @click="deleteWeek(id)">Delete</button>
      </div>
      <div v-if="weeks.length < 6" class="add-week-container">
          <form class="add-week" @submit.prevent="createWeek">
            <input v-model="newWeekName" type="text" placeholder="New week name">
            <button
                type="submit"
                class="btn"
                :disabled="!newWeekName"
            >
              Add Week
            </button>
          </form>
        </div>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>

</style>
