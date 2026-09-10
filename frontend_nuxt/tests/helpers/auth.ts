import { mock } from 'bun:test'
import { createPinia, setActivePinia, defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const api = mock()
export const raw = mock()
export const clear = mock()
export const navigate = mock(async () => {})
export const layout = mock()
export const append = mock()
export const route = { path: '/my/weeks', fullPath: '/my/weeks?q=1' }
export const headers = {
  cookie: 'access_token=old; refresh_token=old-refresh; preference=dark',
}
export const event = {}
export const nuxtApp = {
  $api: api,
  runWithContext: (fn: () => unknown) => fn(),
}
const fetch = Object.assign(api, { create: mock(() => api), raw })
Object.assign(globalThis, {
  defineStore,
  computed,
  ref,
  defineNuxtPlugin: (value: unknown) => value,
  defineNuxtRouteMiddleware: (fn: unknown) => fn,
  useNuxtApp: () => nuxtApp,
  useRuntimeConfig: () => ({ public: { apiUrl: 'http://api.test' } }),
  useRequestHeaders: () => headers,
  useRequestEvent: () => event,
  appendResponseHeader: append,
  $fetch: fetch,
  clearNuxtData: clear,
  useRouter: () => ({ currentRoute: { value: route } }),
  navigateTo: navigate,
  setPageLayout: layout,
  createError: (value: unknown) => value,
  abortNavigation: (value: unknown) => value,
})
export const unauthorized = { status: 401 }
export function reset() {
  setActivePinia(createPinia())
  for (const fn of [api, raw, clear, navigate, layout, append, fetch.create])
    fn.mockReset()
  fetch.create.mockImplementation(() => api)
  raw.mockResolvedValue({ headers: { getSetCookie: () => [] } })
  api.mockResolvedValue({})
  headers.cookie =
    'access_token=old; refresh_token=old-refresh; preference=dark'
  route.path = '/my/weeks'
  route.fullPath = '/my/weeks?q=1'
}
export function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
