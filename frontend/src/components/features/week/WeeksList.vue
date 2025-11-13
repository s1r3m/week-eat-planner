<template>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card 
            v-for="week in weeks"
            :key="week.id"
            :name="week.name"
            class="cursor-pointer"
            @click="handleWeekClick(week.id)"
        />
        <form v-if="weeks.length < 6" @onsubmit.prevent="createWeek">
          <div class="h-64 flex flex-col bg-gray-800 rounded-lg overflow-hidden items-center justify-center p-4">
              <div class="text-5xl text-gray-400 mb-4">+</div>
              <input
                  v-model="newWeekName"
                  type="text"
                  placeholder="New week name"
                  class="p-2 border rounded w-full bg-gray-700 text-white placeholder-gray-400"
              />
              <button class="mt-2 p-2 bg-green-500 text-white rounded w-full" type="submit">
                  Create Week
              </button>
            </div>
          </form>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import type { UserWeek } from '@/types/api'

interface Props { weeks: UserWeek[] }
defineProps<Props>()

const router = useRouter()
const newWeekName = ref('')

const handleWeekClick = (weekId: string) => {
    router.push(`/weeks/${weekId}`)
}

const createWeek = () => {
    if (newWeekName.value.trim()) {
        console.log('Creating week:', newWeekName.value)
        // Here you would typically emit an event or call an API
        newWeekName.value = ''
    }
}
</script>

<style scoped>
</style>
