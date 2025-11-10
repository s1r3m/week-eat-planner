import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useWeeksStore = defineStore('weeks-store', () => {
    const weeks = ref([])

    const cacheWeeks = (data) => {
        weeks.value = data
    }

    const getWeek = (week_id) => {
        const week = weeks.value.filter( (w) => w.id === week_id )
        if (!week) return null
        return week[0]
    }

    return {
        weeks,
        cacheWeeks,
        getWeek
    }
})

