import { beforeEach, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'

import * as authComposable from '@/modules/auth/composables/useAuth'

import { withAppContext } from '../helpers/context'
import { user } from '../helpers/fixtures'

vi.stubGlobal('defineNuxtRouteMiddleware', (middleware: unknown) => middleware)
const { default: auth } = await import('@/core/router/middleware/auth.global')

const getResolvedUser = vi.fn()
beforeEach(() => {
	getResolvedUser.mockReset().mockResolvedValue(null)
	vi.spyOn(authComposable, 'useAuth').mockReturnValue({
		authState: computed(() => 'guest'),
		error: ref(null),
		getResolvedUser,
		refresh: vi.fn(),
		status: ref('success'),
	})
	vi.stubGlobal(
		'createError',
		vi.fn((options: { status: number; statusText: string }) =>
			Object.assign(new Error(options.statusText), options),
		),
	)
})

const route = (
	path: string,
	meta: {
		auth?: 'guest' | 'public' | 'required'
		redirectAuthenticated?: boolean
	} = {},
) =>
	({
		fullPath: `${path}?view=grid#top`,
		meta,
		path,
	}) as Parameters<typeof auth>[0]

it('skips authentication for public pages by default', async () => {
	await auth(route('/'), route('/'))
	expect(authComposable.useAuth).not.toHaveBeenCalled()
	expect(getResolvedUser).not.toHaveBeenCalled()
	expect(navigateTo).not.toHaveBeenCalled()
})

it('does not redirect a guest from an explicitly public page', async () => {
	await auth(route('/weeks/shared', { auth: 'public' }), route('/'))
	expect(getResolvedUser).not.toHaveBeenCalled()
	expect(navigateTo).not.toHaveBeenCalled()
})

it('allows a guest into a guest-only page', async () => {
	await withAppContext(() =>
		auth(route('/login', { auth: 'guest' }), route('/')),
	)
	expect(getResolvedUser).toHaveBeenCalledOnce()
	expect(navigateTo).not.toHaveBeenCalled()
})

it('redirects an authenticated user away from a guest-only page', async () => {
	getResolvedUser.mockResolvedValue(user)
	await withAppContext(() =>
		auth(route('/login', { auth: 'guest' }), route('/')),
	)
	expect(navigateTo).toHaveBeenCalledExactlyOnceWith({ name: 'my-weeks' })
})

it('preserves the intended URL when a guest accesses a protected page', async () => {
	await withAppContext(() =>
		auth(route('/my/weeks', { auth: 'required' }), route('/')),
	)
	expect(navigateTo).toHaveBeenCalledExactlyOnceWith({
		name: 'login',
		query: { redirect: '/my/weeks?view=grid#top' },
	})
})

it('allows an authenticated user into a protected page', async () => {
	getResolvedUser.mockResolvedValue(user)
	await withAppContext(() =>
		auth(route('/my/weeks', { auth: 'required' }), route('/')),
	)
	expect(navigateTo).not.toHaveBeenCalled()
})

it('redirects authenticated users when a public page requests it', async () => {
	getResolvedUser.mockResolvedValue(user)
	await withAppContext(() =>
		auth(
			route('/', { auth: 'public', redirectAuthenticated: true }),
			route('/'),
		),
	)
	expect(navigateTo).toHaveBeenCalledExactlyOnceWith({ name: 'my-weeks' })
})

it('does not redirect a guest when a public page requests an authenticated redirect', async () => {
	await withAppContext(() =>
		auth(
			route('/', { auth: 'public', redirectAuthenticated: true }),
			route('/'),
		),
	)
	expect(navigateTo).not.toHaveBeenCalled()
})

it('returns a service error when session verification fails on a protected page', async () => {
	const error = new Error('Network unavailable')
	getResolvedUser.mockRejectedValue(error)
	await expect(
		withAppContext(() =>
			auth(route('/my/weeks', { auth: 'required' }), route('/')),
		),
	).rejects.toMatchObject({
		status: 503,
		statusText: 'Unable to verify your session. Relogin please.',
	})
})

it('logs session verification errors on pages that can remain accessible', async () => {
	const error = new Error('Network unavailable')
	getResolvedUser.mockRejectedValue(error)
	const consoleError = vi.spyOn(console, 'error').mockImplementation(vi.fn())
	await withAppContext(() =>
		auth(
			route('/', { auth: 'public', redirectAuthenticated: true }),
			route('/'),
		),
	)
	expect(consoleError).toHaveBeenCalledExactlyOnceWith(
		'An error during GET /user',
		error,
	)
	expect(navigateTo).not.toHaveBeenCalled()
})
