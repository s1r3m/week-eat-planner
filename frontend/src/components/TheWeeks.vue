<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useWeekStore } from '@/stores/weeks'

const newWeekName = ref('')

const router = useRouter()
const weekStore = useWeekStore()

const addWeek = () => {
    weekStore.addWeek(newWeekName.value.trim())
    newWeekName.value = ''
}
</script>

<template>
    <div class="weeks-container">
        <h2>Your weeks</h2>
        <p>Weeks count: {{ weekStore.weeks.length }}</p>
        <div v-for="{id, name} in weekStore.weeks" :key="id" class="week-container">
            <span>
                {{ name }}
            </span>
            <button class="btn" @click="router.push(`/weeks/${id}`)">See week</button>
            <button class="btn btn-primary" @click="weekStore.removeWeek(id)">X</button>
        </div>
        <div v-if="weekStore.weeks.length < 6" class="add-week-container">
            <form class="add-week" @submit.prevent="addWeek">
                <label for="new-week-name">New week name:</label>
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
    </div>
</template>

<style scoped>
</style>
