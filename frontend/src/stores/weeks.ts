import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useWeeksStore = defineStore('weeks-store', () => {
    const weeks = ref([])

    const cacheWeeks = (data) => {
        weeks.value = data
    }

    const pushWeek = (week) => {
        if (!week) return
        // Remove the old one if exits and push the new one.
        weeks.value = weeks.value.filter(w => w.id !== week.id)
        weeks.value.push(week)
    }

    const removeWeek = (week_id) => {
        weeks.value = weeks.value.filter(w => w.id !== week_id)
    }

    const getWeek = (week_id) => {
        return weeks.value.find((w) => w.id === week_id)
    }

    return {
        weeks,
        cacheWeeks,
        getWeek,
        pushWeek,
        removeWeek
    }
})

