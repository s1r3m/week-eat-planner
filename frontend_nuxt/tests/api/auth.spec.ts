import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { useAuthApi } from '@/api/auth'

const mockApi = mock()
// Mock useNuxtApp globally for tests
// @ts-ignore
globalThis.useNuxtApp = () => ({
	$api: mockApi,
})

describe('useAuthApi', () => {
	beforeEach(() => {
		mockApi.mockClear()
	})

	const authApi = useAuthApi()

	describe('login', () => {
		it('calls the /auth/login endpoint with POST method and URLSearchParams body', async () => {
			const payload = { username: 'testuser', password: 'password' }
			const mockResponse = { status: 'success' }
			mockApi.mockResolvedValue(mockResponse)

			const result = await authApi.login(payload)

			expect(mockApi).toHaveBeenCalledWith('/auth/login', {
				body: expect.any(URLSearchParams),
				method: 'POST',
			})

			// Check URLSearchParams content
			const lastCall = mockApi.mock.calls[0]
			const body = lastCall[1].body as URLSearchParams
			expect(body.get('username')).toBe(payload.username)
			expect(body.get('password')).toBe(payload.password)
			expect(result).toEqual(mockResponse)
		})
	})

	describe('logout', () => {
		it('calls the /auth/logout endpoint with POST method', async () => {
			mockApi.mockResolvedValue(undefined)

			await authApi.logout()

			expect(mockApi).toHaveBeenCalledWith('/auth/logout', {
				method: 'POST',
			})
		})
	})

	describe('signup', () => {
		it('calls the /auth/signup endpoint with POST method and JSON body', async () => {
			const payload = {
				username: 'testuser',
				email: 'test@example.com',
				password: 'password',
			}
			const mockResponse = { status: 'success' }
			mockApi.mockResolvedValue(mockResponse)

			const result = await authApi.signup(payload)

			expect(mockApi).toHaveBeenCalledWith('/auth/signup', {
				body: payload,
				method: 'POST',
			})
			expect(result).toEqual(mockResponse)
		})
	})
})
