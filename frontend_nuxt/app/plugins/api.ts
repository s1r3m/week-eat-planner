export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiUrl,
    credentials: 'include',
  })

  return { provide: { api } }
})
