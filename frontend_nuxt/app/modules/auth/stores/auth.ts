import type { components } from '#open-fetch-schemas/base-api'

import { isUnauthorized } from '@/modules/auth/utils/session'

type UserData = components['schemas']['UserRead']
type SignupPayload = components['schemas']['UserCreate']
type LoginPayload = Pick<
  components['schemas']['Body_login_auth_login_post'],
  'username' | 'password'
>

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserData | null>(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)
  const isAuthenticated = computed(() => !!user.value)
  const nuxtApp = useNuxtApp()
  const { $api } = nuxtApp
  let initPromise: Promise<void> | null = null
  let sessionVersion = 0

  const clearSession = () => {
    sessionVersion++
    user.value = null
    isInitialized.value = true
    nuxtApp.runWithContext(() => clearNuxtData())
  }

  const fetchUser = async () => {
    const version = sessionVersion
    try {
      const response = await $api<UserData>('/user', {
        skipSessionHandling: true,
      })
      if (version === sessionVersion) {
        user.value = response
        isInitialized.value = true
      }
      return version === sessionVersion ? response : null
    } catch (error) {
      if (!isUnauthorized(error)) throw error
      if (version === sessionVersion) clearSession()
      return null
    }
  }

  const signup = async (body: SignupPayload) => {
    isLoading.value = true
    try {
      const response = await $api<UserData>('/auth/signup', {
        body,
        method: 'POST',
      })
      sessionVersion++
      user.value = response
      isInitialized.value = true
    } finally {
      isLoading.value = false
    }
  }

  const login = async (body: LoginPayload) => {
    isLoading.value = true
    try {
      await $api('/auth/login', {
        body: new URLSearchParams({
          username: body.username,
          password: body.password,
        }),
        method: 'POST',
      })
      sessionVersion++
      if (!(await fetchUser())) {
        throw new Error(
          'Unable to establish your session. Please log in again.',
        )
      }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    isLoading.value = true
    try {
      try {
        await $api<void>('/auth/logout', {
          method: 'POST',
          skipSessionHandling: true,
        })
      } catch (error) {
        if (!isUnauthorized(error)) throw error
      }
      clearSession()
    } finally {
      isLoading.value = false
    }
  }

  const init = (): Promise<void> => {
    if (isInitialized.value) return Promise.resolve()
    initPromise ??= fetchUser()
      .then(() => {})
      .finally(() => {
        initPromise = null
      })
    return initPromise
  }
  return {
    init,
    isAuthenticated,
    isInitialized,
    isLoading,
    fetchUser,
    clearSession,
    login,
    logout,
    signup,
    user,
  }
})
