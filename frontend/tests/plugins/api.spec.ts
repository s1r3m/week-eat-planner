import { expect, it, vi } from 'vitest'

vi.stubGlobal('defineNuxtPlugin', (plugin: unknown) => plugin)
const { default: apiPlugin } = await import('@/plugins/api')

interface ApiClientOptions {
	onRequest: (context: { options: { headers: Headers } }) => void
}

const createApiPlugin = async (cookie?: string) => {
	const api = vi.fn()
	const create = vi.fn<(options: ApiClientOptions) => typeof api>(() => api)
	vi.stubGlobal('useRequestHeaders', () => (cookie ? { cookie } : {}))
	vi.stubGlobal('useRuntimeConfig', () => ({
		public: { apiUrl: 'https://api.example.test' },
	}))
	vi.stubGlobal('$fetch', { create })
	const result = await apiPlugin({} as Parameters<typeof apiPlugin>[0])

	return { api, create, result }
}

it('provides an API client configured with the runtime URL and session credentials', async () => {
	const { api, create, result } = await createApiPlugin()
	expect(create).toHaveBeenCalledExactlyOnceWith(
		expect.objectContaining({
			baseURL: 'https://api.example.test',
			credentials: 'include',
		}),
	)
	expect(result).toEqual({ provide: { api } })
})

it('forwards the request cookie to the API client', async () => {
	const { create } = await createApiPlugin('session=abc')
	const headers = new Headers()
	const options = create.mock.calls[0]?.[0]

	expect(options).toBeDefined()
	options?.onRequest({ options: { headers } })

	expect(headers.get('cookie')).toBe('session=abc')
})

it('does not add a cookie header when the request has no cookie', async () => {
	const { create } = await createApiPlugin()
	const headers = new Headers()
	const options = create.mock.calls[0]?.[0]

	expect(options).toBeDefined()
	options?.onRequest({ options: { headers } })

	expect(headers.has('cookie')).toBe(false)
})
