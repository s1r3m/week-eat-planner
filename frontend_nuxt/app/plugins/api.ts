import { useSessionInvalidHandler } from '@/modules/auth/composables/useSessionInvalidHandler'
import { isUnauthorized } from '@/modules/auth/utils/session'

export type ApiOptions = NonNullable<Parameters<typeof $fetch>[1]> & {
  skipSessionHandling?: boolean
}

export default defineNuxtPlugin({
  name: 'base-api',
  enforce: 'pre',
  setup(nuxtApp) {
    const config = useRuntimeConfig()
    const headers = { ...useRequestHeaders(['cookie']) }
    const event = import.meta.server ? useRequestEvent() : undefined
    const baseURL =
      import.meta.dev && import.meta.client
        ? '/backend-api'
        : config.public.apiUrl
    const api = $fetch.create({ baseURL, credentials: 'include', retry: 0 })
    const excluded = new Set([
      '/auth/login',
      '/auth/signup',
      '/auth/google/exchange',
      '/auth/refresh',
    ])
    let handler: ReturnType<typeof useSessionInvalidHandler> | undefined
    type Recovery = { promise: Promise<void>; invalidation?: Promise<void> }
    let recovery: Recovery | undefined
    let refreshing = false
    let generation = 0

    const invalidate = (group: Recovery) => {
      group.invalidation ??= nuxtApp.runWithContext(() => {
        handler ??= useSessionInvalidHandler()
        return handler.handleSessionInvalid()
      })
      return group.invalidation
    }

    const refreshTokens = async () => {
      const response = await $fetch.raw('/auth/refresh', {
        baseURL,
        credentials: 'include',
        headers,
        method: 'POST',
        retry: 0,
      })
      if (event) {
        const cookies = new Map(
          (headers.cookie ?? '')
            .split(';')
            .filter(Boolean)
            .map((cookie) => {
              const index = cookie.indexOf('=')
              return [cookie.slice(0, index).trim(), cookie.slice(index + 1)]
            }),
        )
        for (const cookie of response.headers.getSetCookie()) {
          appendResponseHeader(event, 'set-cookie', cookie)
          const pair = cookie.split(';', 1)[0]!
          const index = pair.indexOf('=')
          cookies.set(pair.slice(0, index).trim(), pair.slice(index + 1))
        }
        headers.cookie = [...cookies]
          .map(([name, value]) => `${name}=${value}`)
          .join('; ')
      }
    }

    const apiWithRefresh = async <T>(
      request: Parameters<typeof api>[0],
      options: ApiOptions = {},
    ): Promise<T> => {
      const { skipSessionHandling, ...fetchOptions } = options
      const requestGeneration = generation
      const send = () => {
        const requestHeaders = new Headers(fetchOptions.headers)
        if (headers.cookie) requestHeaders.set('cookie', headers.cookie)
        return api<T>(request, {
          ...fetchOptions,
          headers: requestHeaders,
          retry: 0,
        })
      }
      try {
        return await send()
      } catch (error) {
        const url = typeof request === 'string' ? request : request.url
        const path = new URL(url, 'http://local').pathname.replace(
          /^\/backend-api(?=\/)/,
          '',
        )
        if (!isUnauthorized(error) || excluded.has(path)) throw error

        // Requests sent before the latest rotation share its result, including late 401s.
        if (!recovery || (!refreshing && requestGeneration === generation)) {
          refreshing = true
          recovery = {
            promise: refreshTokens().finally(() => {
              generation++
              refreshing = false
            }),
          }
        }
        const group = recovery
        try {
          await group.promise
        } catch (refreshError) {
          if (isUnauthorized(refreshError) && !skipSessionHandling) {
            await invalidate(group)
          }
          throw refreshError
        }
        try {
          return await send()
        } catch (retryError) {
          if (isUnauthorized(retryError) && !skipSessionHandling) {
            await invalidate(group)
          }
          throw retryError
        }
      }
    }
    return { provide: { api: apiWithRefresh } }
  },
})
