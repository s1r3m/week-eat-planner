import { describe, expect, it, mock } from 'bun:test'
import { useUserApi } from '../../app/api/user.ts'

const mockApi = mock()
// Mock useNuxtApp globally for tests
// @ts-ignore
globalThis.useNuxtApp = () => ({
	$api: mockApi,
})

describe('useUserApi', () => {
	const userApi = useUserApi()

	describe('getUser', () => {
		it('calls the /user endpoint', async () => {
			const mockUser = {
				id: '1',
				username: 'testuser',
				email: 'test@example.com',
				avatar_url: null,
				is_active: true,
				oauth_provider: null,
			}
			mockApi.mockResolvedValue(mockUser)

			const result = await userApi.getUser()

			expect(mockApi).toHaveBeenCalledWith('/user')
			expect(result).toEqual(mockUser)
		})
	})
})
