import { flushPromises } from '@vue/test-utils'
import { beforeEach, expect, it, vi } from 'vitest'

import { useAuth } from '@/modules/auth/composables/useAuth'
import { AUTH_KEY } from '@/modules/auth/constants'

import { mountComposable } from '../../helpers/composable'
import { user } from '../../helpers/fixtures'

const api = vi.fn()
beforeEach(() => {
	api.mockReset()
	vi.stubGlobal('useNuxtApp', () => ({ $api: api }))
})

it('transitions from pending to authenticated and shares cached user data', async () => {
	const response = Promise.withResolvers<typeof user>()
	api.mockReturnValue(response.promise)
	const { result, cache } = mountComposable(useAuth)
	expect(result.authState.value).toBe('pending')
	response.resolve(user)
	await flushPromises()
	expect(result.authState.value).toBe('authenticated')
	expect(await result.getResolvedUser()).toEqual(user)
	expect(api).toHaveBeenCalledExactlyOnceWith('/user')
	cache.setQueryData(AUTH_KEY.user(), null)
	expect(result.authState.value).toBe('guest')
	expect(await result.getResolvedUser()).toBeNull()
})

it('exposes authentication failures as an error and rejects resolution', async () => {
	const error = new Error('Unauthorized')
	api.mockRejectedValue(error)
	const { result } = mountComposable(useAuth)
	await expect(result.getResolvedUser()).resolves.toBeNull()
	expect(result.authState.value).toBe('error')
	expect(result.error.value).toBe(error)
})
