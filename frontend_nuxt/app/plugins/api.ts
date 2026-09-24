import { appendResponseHeader } from 'h3'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const event = useRequestEvent()
  const requestHeaders = useRequestHeaders(['cookie'])
  const cookies = new Map<string, string>()
  const requestRefreshes = new WeakMap<object, Promise<void> | undefined>()

  let refreshPromise: Promise<void> | undefined
  let refreshing = false

  const rememberCookie = (cookie: string) => {
    const pair = cookie.split(';', 1)[0]?.trim() ?? ''
    const separator = pair.indexOf('=')

    if (separator > 0) {
      cookies.set(pair.slice(0, separator), pair)
    }
  }

  for (const cookie of (requestHeaders.cookie ?? '').split(';')) {
    rememberCookie(cookie)
  }

  const getCookieHeader = () => cookies.values().toArray().join('; ')

  const transport = $fetch.create({
    baseURL: config.public.apiUrl,
    credentials: 'include',
    retry: 0,
  })

  const refreshSession = async () => {
    const headers = event ? { cookie: getCookieHeader() } : undefined
    refreshing = true

    try {
      const response = await transport.raw('/auth/refresh', {
        headers,
        method: 'POST',
        parseResponse: false,
      })

      if (!event) return

      for (const cookie of response.headers.getSetCookie()) {
        appendResponseHeader(event, 'set-cookie', cookie)
        rememberCookie(cookie)
      }
    } finally {
      refreshing = false
    }
  }

  const api = $fetch.create({
    baseURL: config.public.apiUrl,
    credentials: 'include',
    retry: 1,
    retryStatusCodes: [401],

    async onRequest({ options, request }) {
      const path =
        (typeof request === 'string' ? request : request.url).split(
          /[?#]/,
          1,
        )[0] ?? ''

      const isAuthRequest =
        /\/auth\/(?:login|signup|refresh|google\/exchange)\/?$/.test(path)

      options.retry = isAuthRequest ? 0 : Math.min(Number(options.retry), 1)
      options.retryStatusCodes = [401]

      if (!isAuthRequest && refreshing) {
        await refreshPromise
      }

      requestRefreshes.set(options, refreshPromise)

      if (event) {
        options.headers.set('cookie', getCookieHeader())
      }
    },

    async onResponseError({ options, response }) {
      if (response.status !== 401 || !options.retry) return

      if (requestRefreshes.get(options) === refreshPromise) {
        refreshPromise = refreshSession()
      }

      await refreshPromise
    },
  })

  return {
    provide: { api },
  }
})
