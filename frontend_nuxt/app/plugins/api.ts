import { appendResponseHeader } from 'h3'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const event = useRequestEvent()
  const requestHeaders = useRequestHeaders(['cookie'])
  const cookies = new Map<string, string>()

  let refreshPromise: Promise<void> | undefined

  const rememberCookie = (cookie: string) => {
    const pair = cookie.split(';', 1)[0]?.trim() ?? ''
    const separator = pair.indexOf('=')

    if (separator > 0) {
      cookies.set(pair.slice(0, separator), pair)
    }
  }

  const requestCookies = (requestHeaders.cookie ?? '').split(';')

  for (const cookie of requestCookies) {
    rememberCookie(cookie)
  }

  const getCookieHeader = () => cookies.values().toArray().join('; ')

  const transport = $fetch.create({
    baseURL: config.public.apiUrl,
    credentials: 'include',
    retry: 0,
  })

  const refreshSession = async () => {
    const response = await transport.raw('/auth/refresh', {
      headers: event ? { cookie: getCookieHeader() } : undefined,
      method: 'POST',
    })

    if (!event) return

    const responseCookies = response.headers.getSetCookie()

    for (const cookie of responseCookies) {
      appendResponseHeader(event, 'set-cookie', cookie)
      rememberCookie(cookie)
    }
  }

  const ensureSession = async () => {
    if (!refreshPromise) {
      refreshPromise = refreshSession()
    }

    try {
      await refreshPromise
    } finally {
      refreshPromise = undefined
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

      if (isAuthRequest) {
        options.retry = 0
      }

      if (!isAuthRequest && refreshPromise) {
        await refreshPromise
      }

      if (event) {
        options.headers.set('cookie', getCookieHeader())
      }
    },

    async onResponseError({ options, response }) {
      if (response.status !== 401 || !options.retry) return

      await ensureSession()
    },
  })

  return {
    provide: { api },
  }
})
