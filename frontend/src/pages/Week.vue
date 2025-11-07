<script setup>
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

const showMealSlot = ({ meal_type, day_of_week, recipe_id }) => {
  alert(`${meal_type} for ${day_of_week}\nAssigned recipe: ${recipe_id}`)
}

onMounted(fetchWeek)
</script>

<style scoped>

</style>

<template>
  <div class="week-container">
    <h2>{{ week.name }}</h2>
    <div class="slots-container">
      <button v-for="slot in week.meal_slots" :key="slot.id" class="slot-btn" @click="showMealSlot(slot)">{{ slot.meal_type }}</button>
    </div>
  </div>
</template>
