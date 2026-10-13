import { flushPromises } from '@vue/test-utils'
import { beforeEach, expect, it, vi } from 'vitest'

import {
	getUser,
	loginMutation,
	logoutMutation,
	registerMutation,
} from '@/modules/auth/api/authApi'
import { AUTH_KEY } from '@/modules/auth/constants'
import { getWeeks } from '@/modules/weeks/api/weeksApi'
import { WEEKS_KEY } from '@/modules/weeks/constants'

import { mountComposable } from '../../helpers/composable'
import { user, week } from '../../helpers/fixtures'

const api = vi.fn()
beforeEach(() => {
	api.mockReset()
	vi.stubGlobal('useNuxtApp', () => ({ $api: api }))
})

it('login updates the shared user cache from the authentication response', async () => {
	const nextUser = { ...user, username: 'Updated' }
	api.mockResolvedValue(nextUser)
	const { result, cache } = mountComposable(
		() => ({ login: loginMutation(), current: getUser() }),
		{
			seed: (cache) => cache.setQueryData(AUTH_KEY.user(), user),
		},
	)
	expect(api).not.toHaveBeenCalled()
	await result.login.mutateAsync({
		username: user.email,
		password: 'password123',
	})
	expect(api.mock.calls.map(([path]) => path)).toEqual(['/auth/login'])
	expect(cache.getQueryData(AUTH_KEY.user())).toEqual(nextUser)
})

it('logout invalidates the user query while preserving the weeks cache', async () => {
	api.mockImplementation(async (path) => (path === '/weeks' ? [] : null))
	const { result, cache } = mountComposable(
		() => ({ logout: logoutMutation(), weeks: useQuery(getWeeks()) }),
		{
			seed: (cache) => {
				cache.setQueryData(AUTH_KEY.user(), user)
				cache.setQueryData(WEEKS_KEY.all(), [week()])
			},
		},
	)
	const invalidate = vi.spyOn(cache, 'invalidateQueries')
	await result.logout.mutateAsync()
	await flushPromises()
	expect(api.mock.calls.map(([path]) => path)).toEqual(['/auth/logout'])
	expect(cache.getQueryData(AUTH_KEY.user())).toEqual(user)
	expect(result.weeks.data.value).toEqual([week()])
	expect(invalidate).toHaveBeenCalledExactlyOnceWith({ key: AUTH_KEY.user() })
})

it.each([
	[
		'login',
		() => loginMutation(),
		{ username: user.email, password: 'password123' },
	],
	[
		'signup',
		() => registerMutation(),
		{ email: user.email, username: user.username, password: 'password123' },
	],
] as const)(
	'%s exposes request errors and finishes loading',
	async (_name, composable, payload) => {
		const error = new Error('offline')
		api.mockRejectedValue(error)
		const { result, cache } = mountComposable<
			ReturnType<typeof loginMutation> | ReturnType<typeof registerMutation>
		>(composable, {
			seed: (cache) => cache.setQueryData(AUTH_KEY.user(), user),
		})
		// Both payloads intentionally include all fields needed by either mutation.
		await expect(
			result.mutateAsync({
				...payload,
				username: user.username,
				email: user.email,
			}),
		).rejects.toBe(error)
		expect(result.isLoading.value).toBe(false)
		expect(result.error.value).toBe(error)
		expect(cache.getQueryData(AUTH_KEY.user())).toEqual(user)
	},
)

it('failed logout preserves the user and weeks cache', async () => {
	const error = new Error('offline')
	api.mockRejectedValue(error)
	const { result, cache } = mountComposable(logoutMutation, {
		seed: (cache) => {
			cache.setQueryData(AUTH_KEY.user(), user)
			cache.setQueryData(WEEKS_KEY.all(), [week()])
		},
	})
	await expect(result.mutateAsync()).rejects.toBe(error)
	expect(cache.getQueryData(AUTH_KEY.user())).toEqual(user)
	expect(cache.getQueryData(WEEKS_KEY.all())).toEqual([week()])
	expect(api).toHaveBeenCalledExactlyOnceWith('/auth/logout', {
		method: 'POST',
	})
})

it('registration stores the returned user without an extra session request', async () => {
	api.mockResolvedValue(user)
	const { result, cache } = mountComposable(registerMutation)
	await result.mutateAsync({
		email: user.email,
		username: user.username,
		password: 'password123',
	})
	expect(api).toHaveBeenCalledExactlyOnceWith('/auth/signup', {
		method: 'POST',
		body: {
			email: user.email,
			username: user.username,
			password: 'password123',
		},
	})
	expect(cache.getQueryData(AUTH_KEY.user())).toEqual(user)
})
