export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig()
	const requestHeaders = useRequestHeaders(['cookie'])

	const api = $fetch.create({
		baseURL: config.public.apiUrl,
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
