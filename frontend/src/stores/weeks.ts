import { ref } from 'vue'
import type { Ref } from 'vue'
import type { UserWeek } from '@/types/api'
import { defineStore } from 'pinia'
import apiClient from '@/api/client'
import { useErrorStore } from '@/stores/error'

const errorState = useErrorStore()

export const useWeekStore = defineStore('weeks-store', () => {
    const weeks: Ref<Array<UserWeek>> = ref([])

    const fetchWeeks = async (): Promise<boolean> => {
        try {
            const response = await apiClient.get('/weeks')
            weeks.value = response.data as Array<UserWeek>
            return true
        } catch (error: any) {
            const error_message = error.response?.data?.detail || error.message || 'An unknown error occurred'
            errorState.addError(`Failed to fetch weeks: ${error_message}`)
            // If unauthorized, propagate the error so callers can react (e.g., redirect to login)
            if (error.response?.status === 401) {
                throw error
            }
            return false
        }
    }

    const removeWeek = async (week_id: string) => {
        try {
            const response = await apiClient.delete(`/weeks/${week_id}`)
            if (response.status !== 204) {
                errorState.addError(response.data || 'An unknown error occurred.')
            }
            weeks.value = weeks.value.filter(week => week.id !== week_id)
        } catch (err: any) {
            errorState.addError(err.message)
        }
    }

    const addWeek = async (name: string) => {
        try {
            const response = await apiClient.post('/weeks', { name})
            if (response.status !== 201) {
                throw new Error(response.data || 'An unknown error occurred.')
            }
            weeks.value.push(response.data as UserWeek)
        } catch (err: any) {
            errorState.addError(err.message)
        }
    }

    const getWeek = async (week_id: string): Promise<UserWeek | null> => {
        try {
            const response = await apiClient.get(`/weeks/${week_id}`)
            if (response.status !== 200) {
                throw new Error(response.data || 'An unknown error occurred.')
            }
            return response.data as UserWeek
        } catch (err: any) {
            errorState.addError(err.message)
            return null
        }
    }

    return {
        weeks,
        addWeek,
        getWeek,
        fetchWeeks,
        removeWeek,
    }
})
