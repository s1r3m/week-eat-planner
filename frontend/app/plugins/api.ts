export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig()
	const requestHeaders = useRequestHeaders(['cookie'])

	const api = $fetch.create({
		baseURL: import.meta.env.SSR
			? config.apiUrl || config.public.apiUrl
			: config.public.apiUrl,
		credentials: 'include',
		onRequest({ options }) {
			if (requestHeaders.cookie) {
				options.headers.set('cookie', requestHeaders.cookie)
			}
		},
	})

	return {
		provide: { api },
	}
})
