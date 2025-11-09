<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const week = ref({})
const error = ref('')
const route = useRoute()
const router = useRouter()


async function fetchWeek() {
  error.value = ''

  try {
    const res = await fetch(`/api/weeks/${route.params.id}`, {
      method: 'GET',
      headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')},
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: 'Failed to fetch week' }))
      throw new Error(errorData.detail || 'An unknown error occurred.')
    }

    week.value = await res.json()
  } catch (err) {
    error.value = err.message
    alert(error)
    router.push('/weeks')
  }
}

onMounted(fetchWeek)
</script>

<template>
  <div class="week-container">
    <h2>{{ week.name }}</h2>
    <div class="slots-container">
      <p v-for="slot in week.meal_slots" :key="week.id">
        {{ slot }}
      </p>
    </div>
  </div>
</template>

<style scoped>

</style>
