<template>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card 
            v-for="week in weekStore.weeks"
            :key="week.id"
            :name="week.name"
            interactive
            class="cursor-pointer"
            @click="handleWeekClick(week.id)"
            @edit="handleEdit(week.id)"
            @delete="handleDelete(week.id)"
        />
        <form v-if="weekStore.weeks.length < 6" @submit.prevent="handleWeekCreate">
            <Card :interactive="false">
                <div class="h-full flex flex-col items-center justify-end p-4">
                    <div class="text-8xl text-gray-400 mb-4">+</div>
                    <input
                        v-model="newWeekName"
                        id="new-week-name"
                        name="new-week-name"
                        type="text"
                        placeholder="New week name"
                        class="p-2 border rounded w-full bg-gray-150 text-white placeholder-white-400"
                    />
                </div>
            </Card>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import {useWeekStore} from "@/stores/weeks";

const router = useRouter()
const newWeekName = ref('')
const weekStore = useWeekStore()

const handleWeekClick = (weekId: string) => {
    router.push(`/weeks/${weekId}`)
}

const handleWeekCreate = async () => {
    if (newWeekName.value.trim()) {
        console.log('Creating week:', newWeekName.value)
        await weekStore.addWeek(newWeekName.value)
        newWeekName.value = ''
    }
}

const handleEdit = async (weekId: string) => {
    console.log('Editing the week: ', weekId)
    const week = await weekStore.getWeek(weekId)
    console.log('Week:', week)
}

const handleDelete = async (weekId: string) => {
    console.log('Deleting the week: ', weekId)
    await weekStore.removeWeek(weekId)
}
</script>

<style scoped>
</style>
