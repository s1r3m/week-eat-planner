import type { $Fetch } from 'ofetch'

import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { createEvent, getResponseHeader, setResponseHeader } from 'h3'
import { IncomingMessage, ServerResponse } from 'node:http'
import { Socket } from 'node:net'
import { createFetch } from 'ofetch'

const fetch = mock(
  async (_request: RequestInfo | URL, _options?: RequestInit) =>
    Response.json({ ok: true }),
)
let event: ReturnType<typeof createEvent> | undefined
let headers: { cookie?: string }

Object.assign(globalThis, { defineNuxtPlugin: (setup: unknown) => setup })
const setup = (await import('@/plugins/api')).default as unknown as () => {
  provide: { api: $Fetch }
}

beforeEach(() => {
  fetch.mockReset()
  fetch.mockImplementation(async () => Response.json({ ok: true }))
  event = undefined
  headers = {}
  Object.assign(globalThis, {
    $fetch: createFetch({ fetch: fetch as typeof globalThis.fetch }),
    useRequestEvent: () => event,
    useRequestHeaders: () => headers,
    useRuntimeConfig: () => ({ public: { apiUrl: 'http://api.test/backend' } }),
  })
})

function serverRequest(cookie: string) {
  const request = new IncomingMessage(new Socket())
  request.headers = { cookie }
  event = createEvent(request, new ServerResponse(request))
  headers = { cookie }
  return event
}

function response(status: number, cookies: string[] = []) {
  const result = Response.json({ status }, { status })
  for (const cookie of cookies) result.headers.append('set-cookie', cookie)
  return result
}

const requestPaths = () =>
  fetch.mock.calls.map(([url]) => new URL(String(url)).pathname)
const requestCookie = (index: number) =>
  new Headers(fetch.mock.calls[index]![1]?.headers).get('cookie')

describe('API session renewal', () => {
  it('refreshes and returns the replayed response in the browser', async () => {
    fetch
      .mockResolvedValueOnce(response(401))
      .mockResolvedValueOnce(response(200))
      .mockResolvedValueOnce(Response.json({ id: 'user-1' }))

    expect(await setup().provide.api('/user')).toEqual({ id: 'user-1' })
    expect(requestPaths()).toEqual([
      '/backend/user',
      '/backend/auth/refresh',
      '/backend/user',
    ])
    expect(fetch.mock.calls[1]![1]?.method).toBe('POST')
    for (const [, options] of fetch.mock.calls) {
      expect(options?.credentials).toBe('include')
      expect(new Headers(options?.headers).has('cookie')).toBe(false)
    }
  })

  it('does not refresh again when the replay also returns 401', async () => {
    fetch
      .mockResolvedValueOnce(response(401))
      .mockResolvedValueOnce(response(200))
      .mockResolvedValueOnce(response(401))

    await expect(
      setup().provide.api('/user', { retry: 4 }),
    ).rejects.toMatchObject({ status: 401 })
    expect(requestPaths()).toEqual([
      '/backend/user',
      '/backend/auth/refresh',
      '/backend/user',
    ])
  })

  it.each([
    '/auth/login',
    '/auth/signup',
    '/auth/google/exchange',
    '/auth/refresh',
    'http://api.test/backend/auth/login/?redirect=/my/weeks',
  ])('does not renew a failed authentication request to %s', async (path) => {
    fetch.mockResolvedValueOnce(response(401))

    await expect(
      setup().provide.api(path, { method: 'POST' }),
    ).rejects.toMatchObject({ status: 401 })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it.each([403, 500])(
    'does not renew or replay a %s response',
    async (status) => {
      fetch.mockResolvedValueOnce(response(status))

      await expect(setup().provide.api('/user')).rejects.toMatchObject({
        status,
      })
      expect(fetch).toHaveBeenCalledTimes(1)
    },
  )

  it.each([401, 503])(
    'propagates a refresh failure with status %s without retrying',
    async (status) => {
      fetch
        .mockResolvedValueOnce(response(401))
        .mockResolvedValueOnce(response(status))

      await expect(setup().provide.api('/user')).rejects.toMatchObject({
        status,
      })
      expect(requestPaths()).toEqual(['/backend/user', '/backend/auth/refresh'])
    },
  )

  it('preserves a POST body, query, headers, and signal on replay', async () => {
    fetch
      .mockResolvedValueOnce(response(401))
      .mockResolvedValueOnce(response(200))
      .mockResolvedValueOnce(Response.json({ id: 'week-1' }))
    const controller = new AbortController()
    const options = {
      body: { name: 'My week' },
      headers: { 'x-request-id': 'request-1' },
      method: 'POST' as const,
      query: { source: 'planner' },
      signal: controller.signal,
    }

    expect(await setup().provide.api('/weeks', options)).toEqual({
      id: 'week-1',
    })
    expect(fetch.mock.calls[0]![0]).toBe(
      'http://api.test/backend/weeks?source=planner',
    )
    expect(fetch.mock.calls[2]![0]).toBe(fetch.mock.calls[0]![0])
    expect(fetch.mock.calls[2]![1]).toMatchObject({
      body: JSON.stringify(options.body),
      method: 'POST',
      signal: controller.signal,
    })
    expect(
      new Headers(fetch.mock.calls[2]![1]?.headers).get('x-request-id'),
    ).toBe('request-1')
    expect(options.body).toEqual({ name: 'My week' })
  })

  it('can renew logout when its access cookie has expired', async () => {
    fetch
      .mockResolvedValueOnce(response(401))
      .mockResolvedValueOnce(response(200))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))

    await setup().provide.api('/auth/logout', { method: 'POST' })
    expect(requestPaths()).toEqual([
      '/backend/auth/logout',
      '/backend/auth/refresh',
      '/backend/auth/logout',
    ])
  })

  it('forwards SSR cookies and uses their rotated values for replay and later calls', async () => {
    const originalCookie =
      'access_token=old; refresh_token=old-refresh; preference=dark=mode'
    const requestEvent = serverRequest(originalCookie)
    setResponseHeader(requestEvent, 'set-cookie', 'other=value; Path=/')
    const renewedCookies = [
      'access_token=new; Path=/; HttpOnly; Secure; SameSite=Strict',
      'refresh_token=new-refresh; Path=/; HttpOnly; Expires=Wed, 21 Oct 2037 07:28:00 GMT',
    ]
    fetch
      .mockResolvedValueOnce(response(401))
      .mockResolvedValueOnce(response(200, renewedCookies))

    const { api } = setup().provide
    // Nuxt's active request context need not survive the asynchronous refresh.
    event = undefined
    await api('/user')
    await api('/weeks')

    expect(requestCookie(0)).toBe(originalCookie)
    expect(requestCookie(1)).toBe(originalCookie)
    expect(requestCookie(2)).toBe(
      'access_token=new; refresh_token=new-refresh; preference=dark=mode',
    )
    expect(requestCookie(3)).toBe(requestCookie(2))
    expect(getResponseHeader(requestEvent, 'set-cookie')).toEqual([
      'other=value; Path=/',
      ...renewedCookies,
    ])
    expect(headers.cookie).toBe(originalCookie)
  })

  it('shares renewal with concurrent requests whose 401 arrives after rotation', async () => {
    const late = Promise.withResolvers<Response>()
    const started = Promise.withResolvers<void>()
    const rotation = Promise.withResolvers<Response>()
    const attempts = new Map<string, number>()
    fetch.mockImplementation(async (url) => {
      const path = new URL(String(url)).pathname
      const attempt = (attempts.get(path) ?? 0) + 1
      attempts.set(path, attempt)
      if (path.endsWith('/auth/refresh')) {
        started.resolve()
        return rotation.promise
      }
      if (path.endsWith('/two') && attempt === 1) return late.promise
      return response(attempt === 1 ? 401 : 200)
    })
    const { api } = setup().provide
    const first = api('/one')
    const second = api('/two')
    await started.promise
    rotation.resolve(response(200))
    await first
    late.resolve(response(401))
    await second

    expect(attempts.get('/backend/auth/refresh')).toBe(1)
    expect(attempts.get('/backend/one')).toBe(2)
    expect(attempts.get('/backend/two')).toBe(2)
  })

  it('waits for an ongoing rotation before sending another protected request', async () => {
    const started = Promise.withResolvers<void>()
    const rotation = Promise.withResolvers<Response>()
    fetch
      .mockResolvedValueOnce(response(401))
      .mockImplementationOnce(async () => {
        started.resolve()
        return rotation.promise
      })
    const { api } = setup().provide
    const first = api('/one')
    await started.promise
    const second = api('/two')
    expect(fetch).toHaveBeenCalledTimes(2)

    rotation.resolve(response(200))
    await Promise.all([first, second])
    expect(
      requestPaths().filter((path) => path.endsWith('/auth/refresh')),
    ).toHaveLength(1)
    expect(requestPaths().filter((path) => path.endsWith('/two'))).toHaveLength(
      1,
    )
    expect(fetch).toHaveBeenCalledTimes(4)
  })

  it('shares a failed rotation with late failures and allows a later request to try again', async () => {
    const late = Promise.withResolvers<Response>()
    fetch
      .mockResolvedValueOnce(response(401))
      .mockImplementationOnce(async () => late.promise)
      .mockResolvedValueOnce(response(503))
    const { api } = setup().provide
    const first = api('/one')
    const second = api('/two')
    const outcomes = Promise.allSettled([first, second])
    await expect(first).rejects.toMatchObject({ status: 503 })
    late.resolve(response(401))
    const results = await outcomes
    expect(results.every((result) => result.status === 'rejected')).toBe(true)
    expect(fetch).toHaveBeenCalledTimes(3)

    fetch
      .mockResolvedValueOnce(response(401))
      .mockResolvedValueOnce(response(200))
    await api('/three')
    expect(fetch).toHaveBeenCalledTimes(6)
  })

  it('keeps simultaneous SSR sessions and cookie rotations separate', async () => {
    fetch.mockImplementation(async (url, options) => {
      const cookie = new Headers(options?.headers).get('cookie') ?? ''
      const user = cookie.includes('alice') ? 'alice' : 'bob'
      if (String(url).endsWith('/auth/refresh')) {
        return response(200, [`access_token=${user}-new; Path=/; HttpOnly`])
      }
      return cookie.includes('-new') ? Response.json({ user }) : response(401)
    })
    const aliceEvent = serverRequest(
      'access_token=alice-old; refresh_token=alice-refresh',
    )
    const alice = setup().provide.api
    const bobEvent = serverRequest(
      'access_token=bob-old; refresh_token=bob-refresh',
    )
    const bob = setup().provide.api

    expect(await Promise.all([alice('/user'), bob('/user')])).toEqual([
      { user: 'alice' },
      { user: 'bob' },
    ])
    expect(getResponseHeader(aliceEvent, 'set-cookie')).toEqual([
      'access_token=alice-new; Path=/; HttpOnly',
    ])
    expect(getResponseHeader(bobEvent, 'set-cookie')).toEqual([
      'access_token=bob-new; Path=/; HttpOnly',
    ])
    expect(
      requestPaths().filter((path) => path.endsWith('/auth/refresh')),
    ).toHaveLength(2)
  })
})
