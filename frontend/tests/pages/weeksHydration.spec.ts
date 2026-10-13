import {
	hydrateQueryCache,
	PiniaColada,
	serializeQueryCache,
	useQueryCache,
} from '@pinia/colada'
import { flushPromises } from '@vue/test-utils'
import { createPinia, disposePinia } from 'pinia'
import { expect, it, vi } from 'vitest'
import { createSSRApp, effectScope, h } from 'vue'
import { renderToString } from 'vue/server-renderer'

import { AUTH_KEY } from '@/modules/auth/constants'
import { getWeeks } from '@/modules/weeks/api/weeksApi'
import WeeksPage from '@/pages/my/weeks.vue'

import { user, week } from '../helpers/fixtures'
import { uiStubs } from '../helpers/ui'

const EmptyStub = () => null

function createApp() {
	const app = createSSRApp({ render: () => h(WeeksPage) })
	const pinia = createPinia()
	app.use(pinia).use(PiniaColada, {
		queryOptions: { staleTime: Infinity, gcTime: Infinity },
	})
	for (const [name, component] of Object.entries(uiStubs)) {
		if (typeof component === 'object') app.component(name, component)
	}
	app.component('Icon', EmptyStub)
	app.component('ClientOnly', EmptyStub)
	return { app, pinia }
}

it.each([[], [week()]].map((weeks) => ({ weeks })))(
	'renders and hydrates resolved weeks when the shared query starts outside the page: $weeks',
	async ({ weeks }) => {
		const api = vi.fn().mockResolvedValue(weeks)
		vi.stubGlobal('useNuxtApp', () => ({ $api: api }))
		const warn = vi.spyOn(console, 'warn').mockImplementation(vi.fn())
		const error = vi.spyOn(console, 'error').mockImplementation(vi.fn())
		const server = createApp()
		const scope = effectScope()
		const serverCache = server.app.runWithContext(() => useQueryCache())
		serverCache.setQueryData(AUTH_KEY.user(), user)
		// Middleware or another consumer can initialize the shared query without
		// a component instance, so useQuery cannot register a server prefetch hook.
		server.app.runWithContext(() => scope.run(() => useQuery(getWeeks())))
		const html = await renderToString(server.app)
		expect(html).not.toContain('loading-state')
		expect(html).toContain(weeks.length > 0 ? 'Week one' : 'No weeks yet')
		const payload = serializeQueryCache(serverCache)
		scope.stop()
		disposePinia(server.pinia)

		const client = createApp()
		const clientCache = client.app.runWithContext(() => useQueryCache())
		hydrateQueryCache(clientCache, payload)
		const container = document.createElement('div')
		// eslint-disable-next-line unicorn/no-unsafe-dom-html -- HTML comes from this test app’s SSR renderer.
		container.innerHTML = html
		document.body.append(container)
		try {
			client.app.mount(container)
			await flushPromises()
			expect(container.textContent).toContain(
				weeks.length > 0 ? 'Week one' : 'No weeks yet',
			)
			expect(api).toHaveBeenCalledExactlyOnceWith('/weeks')
			expect(warn.mock.calls.flat().join(' ')).not.toContain('Hydration')
			expect(error.mock.calls.flat().join(' ')).not.toContain('hydration')
		} finally {
			client.app.unmount()
			disposePinia(client.pinia)
			container.remove()
		}
	},
)
