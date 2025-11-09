import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth-store', () => {
    const access_token = ref<String | null>(null)

    const setSession = (data) => {
        if (data.token_type !== 'bearer') {
            return
        }
        access_token.value = data.access_token
    }

    return {
        access_token,
        setSession,
    }
})
