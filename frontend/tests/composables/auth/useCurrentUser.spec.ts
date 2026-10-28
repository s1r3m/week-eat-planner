import { flushPromises } from '@vue/test-utils'
import { FetchError } from 'ofetch'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getUser } from '@/modules/auth/api/authApi'
import { AUTH_KEY } from '@/modules/auth/constants'

import { mountComposable } from '../../helpers/composable'
import { user } from '../../helpers/fixtures'

const api = vi.fn()
beforeEach(() => {
	api.mockReset()
	vi.stubGlobal('useNuxtApp', () => ({ $api: api }))
})

describe('getUser', () => {
	it('fetches and shares the current user', async () => {
		api.mockResolvedValue(user)
		const { result, cache } = mountComposable(
			() => [getUser(), getUser()] as const,
		)
		await flushPromises()
		expect(api).toHaveBeenCalledExactlyOnceWith('/user')
		expect(result[0].data.value).toEqual(user)
		expect(result[1].data.value).toEqual(user)
		expect(cache.getQueryData(AUTH_KEY.user())).toEqual(user)
	})

	it('retains unauthorized errors from the API plugin', async () => {
		api.mockRejectedValue({ status: 401 })
		const { result } = mountComposable(getUser)
		await flushPromises()
		expect(result.data.value).toBeUndefined()
		expect(result.error.value).toEqual({ status: 401 })
	})

	it('treats a fetch-level unauthorized response as a guest', async () => {
		api.mockRejectedValue(
			Object.assign(new FetchError('Unauthorized'), {
				response: { status: 401 },
			}),
		)
		const { result } = mountComposable(getUser)
		await flushPromises()
		expect(result.data.value).toBeNull()
		expect(result.error.value).toBeNull()
	})

	it('retains other errors and propagates an explicitly throwing refetch', async () => {
		const error = new Error('offline')
		api.mockRejectedValue(error)
		const { result } = mountComposable(getUser)
		await flushPromises()
		expect(result.error.value).toBe(error)
		await expect(result.refetch(true)).rejects.toBe(error)
	})
})
