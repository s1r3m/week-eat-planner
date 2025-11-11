import { ref } from 'vue'
import type { Ref } from 'vue'
import { defineStore } from 'pinia'
import type { UserWeek } from '@/types/api'

export const useWeeksStore = defineStore('weeks-store', () => {
    const weeks: Ref<Array<UserWeek>> = ref([])

    const cacheWeeks = (data: Array<UserWeek>) => {
        weeks.value = data
    }

    const pushWeek = (week: UserWeek) => {
        if (!week) return
        // Remove the old one if exits and push the new one.
        weeks.value = weeks.value.filter(w => w.id !== week.id)
        weeks.value.push(week)
    }

    const removeWeek = (week_id: string) => {
        weeks.value = weeks.value.filter(w => w.id !== week_id)
    }

    const getWeek = (week_id: string) => {
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

