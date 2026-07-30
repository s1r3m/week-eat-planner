import { describe, expect, it, mock, beforeEach } from 'bun:test'
import { createPinia, setActivePinia, defineStore } from 'pinia'
import { ref, computed } from 'vue'

const mockApi = mock()
// Mock useNuxtApp globally for tests
// @ts-ignore
globalThis.useNuxtApp = () => ({
	$api: mockApi,
})

// Mock Nuxt/Vue globals
// @ts-ignore
globalThis.defineStore = defineStore
// @ts-ignore
globalThis.ref = ref
// @ts-ignore
globalThis.computed = computed

// Import store
const { useAuthStore } = await import('@/stores/auth')

describe('useAuthStore', () => {
	beforeEach(() => {
		setActivePinia(createPinia())
		mockApi.mockClear()
	})

	it('initializes with null user and not authenticated', () => {
		const store = useAuthStore()
		expect(store.user).toBeNull()
		expect(store.isAuthenticated).toBe(false)
	})

	describe('signup', () => {
		it('calls signup and then gets user', async () => {
			const payload = {
				username: 'test',
				email: 'test@example.com',
				password: 'password',
			}
			const mockUser = { username: 'test', id: '1' }

			// Mock API responses
			mockApi.mockResolvedValueOnce({ status: 'success' }) // signup
			mockApi.mockResolvedValueOnce(mockUser) // getUser

			const store = useAuthStore()
			await store.signup(payload)

			expect(mockApi).toHaveBeenCalledWith('/auth/signup', {
				body: payload,
				method: 'POST',
			})
			expect(mockApi).toHaveBeenCalledWith('/user')
			expect(store.user).toEqual(mockUser)
			expect(store.isAuthenticated).toBe(true)
		})
	})

	describe('login', () => {
		it('calls login and then gets user', async () => {
			const payload = { username: 'test', password: 'password' }
			const mockUser = { username: 'test', id: '1' }

			// Mock API responses
			mockApi.mockResolvedValueOnce({ status: 'success' }) // login
			mockApi.mockResolvedValueOnce(mockUser) // getUser

			const store = useAuthStore()
			await store.login(payload)

			expect(mockApi).toHaveBeenCalledWith('/auth/login', {
				body: expect.any(URLSearchParams),
				method: 'POST',
			})
			expect(mockApi).toHaveBeenCalledWith('/user')
			expect(store.user).toEqual(mockUser)
			expect(store.isAuthenticated).toBe(true)
		})
	})

	describe('logout', () => {
		it('calls logout and clears user', async () => {
			const store = useAuthStore()
			store.user = { username: 'test', id: '1' } as any

			mockApi.mockResolvedValue(undefined)

			await store.logout()

			expect(mockApi).toHaveBeenCalledWith('/auth/logout', {
				method: 'POST',
			})
			expect(store.user).toBeNull()
			expect(store.isAuthenticated).toBe(false)
		})
	})

	describe('init', () => {
		it('returns early if user is already set', async () => {
			const store = useAuthStore()
			const mockUser = { username: 'test', id: '1' }
			store.user = mockUser as any

			await store.init()

			expect(mockApi).not.toHaveBeenCalled()
			expect(store.user).toEqual(mockUser)
		})

		it('fetches user if not set', async () => {
			const store = useAuthStore()
			const mockUser = { username: 'test', id: '1' }
			mockApi.mockResolvedValueOnce(mockUser)

			await store.init()

			expect(mockApi).toHaveBeenCalledWith('/user')
			expect(store.user).toEqual(mockUser)
		})

		it('sets user to null on error', async () => {
			const store = useAuthStore()
			mockApi.mockRejectedValueOnce(new Error('Unauthorized'))

			await store.init()

			expect(mockApi).toHaveBeenCalledWith('/user')
			expect(store.user).toBeNull()
		})
	})
})
