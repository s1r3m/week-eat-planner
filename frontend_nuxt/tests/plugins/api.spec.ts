import { describe, expect, it, mock, beforeEach } from 'bun:test'

// Mock Nuxt globals
const mockConfig = {
	public: {
		apiBase: 'http://api.test',
	},
}
const mockHeaders = { cookie: 'test-cookie' }
const mockFetch = mock()
// @ts-ignore
mockFetch.create = mock(() => mockFetch)

// @ts-ignore
globalThis.defineNuxtPlugin = (fn: any) => fn
// @ts-ignore
globalThis.useRuntimeConfig = () => mockConfig
// @ts-ignore
globalThis.useRequestHeaders = () => mockHeaders
// @ts-ignore
globalThis.$fetch = mockFetch
// @ts-ignore
globalThis.useRequestEvent = mock()
// @ts-ignore
globalThis.appendResponseHeader = mock()

// Import the plugin
// We need to import it after mocking globals
const plugin = (await import('@/plugins/api')).default

describe('api plugin', () => {
	beforeEach(() => {
		mockFetch.mockClear()
		// @ts-ignore
		mockFetch.create.mockClear()
		// @ts-ignore
		globalThis.useRequestEvent.mockClear()
		// @ts-ignore
		globalThis.appendResponseHeader.mockClear()
	})

	it('initializes the api client with correct config', () => {
		// @ts-ignore
		plugin()
		// @ts-ignore
		expect(mockFetch.create).toHaveBeenCalledWith({
			baseURL: 'http://api.test',
			credentials: 'include',
			headers: mockHeaders,
		})
	})

	describe('$api wrapper', () => {
		it('performs a successful request', async () => {
			const { provide } = plugin() as any
			const $api = provide.api
			mockFetch.mockResolvedValue({ data: 'ok' })

			const result = await $api('/test')

			expect(result).toEqual({ data: 'ok' })
			expect(mockFetch).toHaveBeenCalledWith('/test', undefined)
		})

		it('refreshes token on 401 and retries the request', async () => {
			const { provide } = plugin() as any
			const $api = provide.api

			// 1. Initial request fails with 401
			const error401 = {
				response: new Response(null, { status: 401 }),
			}
			mockFetch.mockRejectedValueOnce(error401)

			// 2. Refresh tokens succeeds
			mockFetch.mockResolvedValueOnce({
				headers: {
					getSetCookie: () => [],
				},
			})

			// 3. Retry succeeds
			mockFetch.mockResolvedValueOnce({ data: 'retried' })

			const result = await $api('/test')

			expect(result).toEqual({ data: 'retried' })
			// Check calls: 1. /test, 2. /auth/refresh, 3. /test (retry)
			expect(mockFetch).toHaveBeenCalledTimes(3)
			expect(mockFetch.mock.calls[0][0]).toBe('/test')
			expect(mockFetch.mock.calls[1][0]).toBe('/auth/refresh')
			expect(mockFetch.mock.calls[1][1].method).toBe('POST')
			expect(mockFetch.mock.calls[2][0]).toBe('/test')
			expect(mockFetch.mock.calls[2][1]._retry).toBe(true)
		})

		it('does not refresh on 401 for auth requests', async () => {
			const { provide } = plugin() as any
			const $api = provide.api

			const error401 = {
				response: new Response(null, { status: 401 }),
			}
			mockFetch.mockRejectedValue(error401)

			await expect($api('/auth/login')).rejects.toEqual(error401)
			expect(mockFetch).toHaveBeenCalledTimes(1)
			expect(mockFetch).not.toHaveBeenCalledWith(
				'/auth/refresh',
				expect.anything(),
			)
		})

		it('coalesces concurrent refreshes', async () => {
			const { provide } = plugin() as any
			const $api = provide.api

			const error401 = {
				response: new Response(null, { status: 401 }),
			}

			// Mock /auth/refresh with a delay
			let refreshCalled = 0
			mockFetch.mockImplementation(async (url: string, options: any) => {
				if (url === '/auth/refresh') {
					refreshCalled++
					await new Promise((resolve) => setTimeout(resolve, 50))
					return { headers: { getSetCookie: () => [] } }
				}
				if ((url === '/test1' || url === '/test2') && !options?._retry) {
					throw error401
				}
				return { data: 'ok' }
			})

			// Trigger two concurrent requests that both hit 401
			const p1 = $api('/test1')
			const p2 = $api('/test2')

			const [r1, r2] = await Promise.all([p1, p2])

			expect(r1).toEqual({ data: 'ok' })
			expect(r2).toEqual({ data: 'ok' })
			// /auth/refresh should only be called once
			expect(refreshCalled).toBe(1)
		})

		it('throws original error if refresh fails', async () => {
			const { provide } = plugin() as any
			const $api = provide.api

			const error401 = {
				response: new Response(null, { status: 401 }),
			}
			mockFetch.mockRejectedValueOnce(error401) // initial
			mockFetch.mockRejectedValueOnce(new Error('Refresh failed')) // refresh

			await expect($api('/test')).rejects.toThrow('Refresh failed')
		})

		it('synchronizes cookies on server-side during refresh', async () => {
			// Mock import.meta.server using prototype hack as it's module-scoped in Bun.
			Object.defineProperty(Object.prototype, 'server', {
				get() {
					return (globalThis as any)._MOCK_SERVER_
				},
				configurable: true,
			})
			;(globalThis as any)._MOCK_SERVER_ = true

			const mockEvent = {}
			// @ts-ignore
			globalThis.useRequestEvent.mockReturnValue(mockEvent)

			const { provide } = plugin() as any
			const $api = provide.api

			const error401 = {
				response: new Response(null, { status: 401 }),
			}
			mockFetch.mockRejectedValueOnce(error401)

			// Refresh with cookies
			const mockSetCookies = ['token=new; Path=/; HttpOnly', 'other=val']
			mockFetch.mockResolvedValueOnce({
				headers: {
					getSetCookie: () => mockSetCookies,
				},
			})

			mockFetch.mockResolvedValueOnce({ data: 'ok' })

			await $api('/test')

			// @ts-ignore
			expect(globalThis.appendResponseHeader).toHaveBeenCalledWith(
				mockEvent,
				'set-cookie',
				mockSetCookies[0],
			)
			// @ts-ignore
			expect(globalThis.appendResponseHeader).toHaveBeenCalledWith(
				mockEvent,
				'set-cookie',
				mockSetCookies[1],
			)

			// Check if headers were updated
			expect(mockHeaders.cookie).toBe('token=new; other=val')

			// Reset
			delete (Object.prototype as any).server
			;(globalThis as any)._MOCK_SERVER_ = false
		})
	})
})
