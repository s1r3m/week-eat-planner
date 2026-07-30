export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig()
	const headers = useRequestHeaders(['cookie'])
	let refreshPromise: null | Promise<void> = null

	const api = $fetch.create({
		baseURL: config.public.apiBase,
		credentials: 'include',
		headers,
	})

	const refreshTokens = async () => {
		const response = await $fetch<Response>('/auth/refresh', {
			baseURL: config.public.apiBase,
			credentials: 'include',
			headers,
			method: 'POST',
		})
		if (import.meta.server) {
			const event = useRequestEvent()

			if (event) {
				const cookies = response.headers.getSetCookie()

				for (const cookie of cookies) {
					appendResponseHeader(event, 'set-cookie', cookie)
				}

				const cookieHeader = cookies
					.map((cookie) => cookie.split(';', 1)[0])
					.join('; ')

				if (cookieHeader) {
					headers.cookie = cookieHeader
				}
			}
		}
	}

	const isUnauthorized = (error: unknown): boolean => {
		return (
			typeof error === 'object' &&
			error !== null &&
			'response' in error &&
			error.response instanceof Response &&
			error.response.status === 401
		)
	}

	const isAuthRequest = (request: Parameters<typeof api>[0]): boolean => {
		const url = typeof request === 'string' ? request : request.url
		return url.startsWith('/auth/')
	}

	const apiWithRefresh = async <T>(
		request: Parameters<typeof api>[0],
		options?: Parameters<typeof api>[1] & { _retry?: boolean },
	): Promise<T> => {
		try {
			return await api<T>(request, options)
		} catch (error) {
			if (!isUnauthorized(error) || isAuthRequest(request) || options?._retry) {
				throw error
			}

			if (!refreshPromise) {
				refreshPromise = (async () => {
					try {
						await refreshTokens()
					} finally {
						refreshPromise = null
					}
				})()
			}

			await refreshPromise

			return api(request, { ...options, _retry: true })
		}
	}

	return { provide: { api: apiWithRefresh } }
})
