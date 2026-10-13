import { beforeEach, describe, expect, it, vi } from 'vitest'

import { logoutMutation } from '@/modules/auth/api/authApi'

import { withAppContext } from '../helpers/context'
import { stubGlobals } from '../helpers/globals'

const api = vi.fn()

beforeEach(() => {
	api.mockReset()
	stubGlobals({
		useNuxtApp: () => ({ $api: api }),
	})
})

describe('logoutMutation', () => {
	it('posts to the logout endpoint and returns the response', async () => {
		api.mockResolvedValue(null)

		expect(await withAppContext(logoutMutation).mutateAsync()).toBeNull()
		expect(api).toHaveBeenCalledTimes(1)
		expect(api).toHaveBeenCalledWith('/auth/logout', { method: 'POST' })
	})

	it('propagates logout failures to the caller', async () => {
		const error = new Error('Network error')
		api.mockRejectedValue(error)

		await expect(withAppContext(logoutMutation).mutateAsync()).rejects.toBe(
			error,
		)
		expect(api).toHaveBeenCalledTimes(1)
	})
})
