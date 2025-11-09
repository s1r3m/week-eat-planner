<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from "@/stores/userAuth";

const authStore = useAuthStore()
const weeks = ref([])
const error = ref('')
const newWeekName = ref('')
const router = useRouter()

;(async () => {
  error.value = ''
  try {
    console.log(`Try fetchin weeks with ${authStore.access_token}`)
    if (authStore.access_token === null) {
      router.push('/login')
    }
    const res = await fetch('/api/weeks', {
      method: 'GET',
      headers: {'Authorization': `Bearer ${authStore.access_token}`},
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: 'Failed to fetch weeks' }))
      throw new Error(errorData.detail || 'An unknown error occurred.')
    }

    weeks.value = await res.json()
  }
  catch (err) {
    error.value = err.message
  }
})()

const createWeek = async () => {
  error.value = ''
  try {
    const res = await fetch('/api/weeks', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${authStore.access_token}`},
      body: JSON.stringify({name: newWeekName.value})
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: 'Failed to create week' }))
      throw new Error(errorData.detail || 'An unknown error occurred.')
    }
    weeks.value.push(await res.json())
    newWeekName.value = ''
  } catch (err) {
    error.value = err.message
  }
}

const deleteWeek = async (week_id) => {
  error.value = ''
  try {
    const res = await fetch('/api/weeks/' + week_id, {
      method: 'DELETE',
      headers: {'Authorization': `Bearer ${authStore.access_token}`},
    })

    if (res.status !== 204) {
      const errorData = await res.json().catch(() => ({detail: 'Failed to delete'}))
      throw new Error(errorData.detail || 'An unknown error occurred.')
    }
    weeks.value = weeks.value.filter(w => w.id !== week_id)
  } catch (err) {
    error.value = err.message
  }
}
</script>

<template>
  <div class="weeks">
    <h2>Your weeks</h2>
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
</template>

<style scoped>

</style>
