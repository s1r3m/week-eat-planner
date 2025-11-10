import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth-store', () => {
    const access_token = ref<String | null>(null)

    const setToken = (data) => {
        if (data.token_type !== 'bearer') {
            return
        }
        access_token.value = data.access_token
    }

    const clearToken = () => {
        access_token.value = null
    }

    const isAuthenticated = computed(() => !!access_token.value)

    return {
        access_token,
        isAuthenticated,
        setSession: setToken,
        clearToken
    }
})
