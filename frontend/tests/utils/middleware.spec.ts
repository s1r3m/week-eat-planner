import { beforeEach, expect, it, vi } from 'vitest'

import { withAppContext } from '../helpers/context'
import { user } from '../helpers/fixtures'

vi.stubGlobal('defineNuxtRouteMiddleware', (middleware: unknown) => middleware)
const { default: auth } = await import('@/core/router/middleware/auth.global')

const api = vi.fn()
beforeEach(() => {
	api.mockReset()
	vi.stubGlobal('useNuxtApp', () => ({ $api: api }))
	vi.stubGlobal('setPageLayout', vi.fn())
})

const route = (path: string) =>
	({ path, fullPath: `${path}?view=grid#top` }) as Parameters<typeof auth>[0]

it.each(['/', '/login', '/signup', '/weeks/shared', '/recipes/shared'])(
	'skips authentication for the public route %s',
	async (path) => {
		await auth(route(path), route('/'))
		expect(api).not.toHaveBeenCalled()
		expect(navigateTo).not.toHaveBeenCalled()
	},
)

it('preserves the intended URL when a guest accesses a protected page', async () => {
	api.mockResolvedValue(null)
	await withAppContext(() => auth(route('/my/weeks'), route('/')))
	expect(navigateTo).toHaveBeenCalledExactlyOnceWith({
		path: '/login',
		query: { redirect: '/my/weeks?view=grid#top' },
	})
})

it('allows an authenticated user into a protected page', async () => {
	api.mockResolvedValue(user)
	await withAppContext(() => auth(route('/my/weeks'), route('/')))
	expect(navigateTo).not.toHaveBeenCalled()
})
