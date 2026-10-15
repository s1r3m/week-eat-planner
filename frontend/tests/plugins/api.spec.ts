import { expect, it, vi } from 'vitest'

vi.stubGlobal('defineNuxtPlugin', (plugin: unknown) => plugin)
const { default: apiPlugin } = await import('@/plugins/api')

it('provides an API client configured with the runtime URL and session credentials', async () => {
	const api = vi.fn()
	const create = vi.fn(() => api)
	vi.stubGlobal('useRuntimeConfig', () => ({
		public: { apiUrl: 'https://api.example.test' },
	}))
	vi.stubGlobal('$fetch', { create })
	const result = await apiPlugin({} as Parameters<typeof apiPlugin>[0])
	expect(create).toHaveBeenCalledExactlyOnceWith({
		baseURL: 'https://api.example.test',
		credentials: 'include',
	})
	expect(result).toEqual({ provide: { api } })
})
