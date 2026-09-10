import { beforeEach, afterEach, describe, expect, it } from 'bun:test'
import {
  api,
  raw,
  clear,
  navigate,
  layout,
  append,
  headers,
  event,
  nuxtApp,
  route,
  reset,
  unauthorized,
  deferred,
} from '../helpers/auth'
const plugin = (await import('@/plugins/api')).default
const { useAuthStore } = await import('@/modules/auth/stores/auth')
const setup = () => (plugin as any).setup(nuxtApp).provide.api
beforeEach(reset)
afterEach(() => {
  delete (Object.prototype as any).server
})

describe('API recovery', () => {
  it('uses configured transport and disables automatic retries', async () => {
    const client = setup()
    await client('/user', { retry: 4 })
    expect((api as any).create).toHaveBeenCalledWith({
      baseURL: 'http://api.test',
      credentials: 'include',
      retry: 0,
    })
    expect(api.mock.calls[0][1].retry).toBe(0)
  })
  it('refreshes once and replays concurrent requests, including late 401s', async () => {
    const client = setup()
    const late = deferred<unknown>()
    api
      .mockRejectedValueOnce(unauthorized)
      .mockImplementationOnce(() => late.promise)
      .mockResolvedValue({ ok: true })
    const first = client('/one')
    const second = client('/two')
    await first
    late.reject(unauthorized)
    expect(await second).toEqual({ ok: true })
    expect(raw).toHaveBeenCalledTimes(1)
    expect(api).toHaveBeenCalledTimes(4)
  })
  it.each([
    '/auth/login',
    '/auth/signup',
    '/auth/google/exchange',
    '/auth/refresh',
  ])('does not recover %s', async (path) => {
    const client = setup()
    api.mockRejectedValue(unauthorized)
    await expect(client(path)).rejects.toEqual(unauthorized)
    expect(raw).not.toHaveBeenCalled()
    expect(clear).not.toHaveBeenCalled()
  })
  it('allows logout recovery while suppressing session handling', async () => {
    const client = setup()
    api.mockRejectedValueOnce(unauthorized).mockResolvedValue(undefined)
    await client('/auth/logout', { method: 'POST', skipSessionHandling: true })
    expect(raw).toHaveBeenCalledTimes(1)
    expect(clear).not.toHaveBeenCalled()
    expect(api.mock.calls[0][1].skipSessionHandling).toBeUndefined()
  })
  it('clears and redirects only once for a group of terminal failures', async () => {
    const client = setup()
    api.mockRejectedValue(unauthorized)
    raw.mockRejectedValue(unauthorized)
    await Promise.allSettled([client('/one'), client('/two')])
    expect(raw).toHaveBeenCalledTimes(1)
    expect(clear).toHaveBeenCalledTimes(1)
    expect(navigate).toHaveBeenCalledTimes(1)
    expect(navigate).toHaveBeenCalledWith({
      path: '/login',
      query: { redirect: '/my/weeks?q=1' },
    })
  })
  it('handles a replayed 401 without refreshing again', async () => {
    const client = setup()
    api.mockRejectedValue(unauthorized)
    await expect(client('/user')).rejects.toEqual(unauthorized)
    expect(raw).toHaveBeenCalledTimes(1)
    expect(clear).toHaveBeenCalledTimes(1)
  })
  it.each([new Error('offline'), { status: 500 }])(
    'preserves auth on refresh outages',
    async (error) => {
      const client = setup()
      const store = useAuthStore()
      store.user = { id: '1' } as any
      api.mockRejectedValue(unauthorized)
      raw.mockRejectedValue(error)
      await expect(client('/user')).rejects.toEqual(error)
      expect(store.isAuthenticated).toBe(true)
      expect(clear).not.toHaveBeenCalled()
    },
  )
  it('suppresses terminal handling for initialization', async () => {
    const client = setup()
    api.mockRejectedValue(unauthorized)
    raw.mockRejectedValue(unauthorized)
    await expect(
      client('/user', { skipSessionHandling: true }),
    ).rejects.toEqual(unauthorized)
    expect(clear).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
  })
  it('keeps shared pages open anonymously', async () => {
    route.path = '/weeks/abc'
    route.fullPath = '/weeks/abc'
    const client = setup()
    api.mockRejectedValue(unauthorized)
    raw.mockRejectedValue(unauthorized)
    await expect(client('/weeks/abc')).rejects.toEqual(unauthorized)
    expect(clear).toHaveBeenCalledTimes(1)
    expect(navigate).not.toHaveBeenCalled()
    expect(layout).toHaveBeenCalledWith('default')
  })
  it('captures SSR event and merges rotated cookies for replay and later requests', async () => {
    Object.defineProperty(Object.prototype, 'server', {
      configurable: true,
      get: () => true,
    })
    const client = setup()
    api.mockRejectedValueOnce(unauthorized).mockResolvedValue({})
    const cookies = [
      'access_token=new; Path=/; HttpOnly',
      'refresh_token=new-refresh; Path=/; HttpOnly',
    ]
    raw.mockResolvedValue({ headers: { getSetCookie: () => cookies } })
    await client('/one')
    await client('/two')
    expect(append).toHaveBeenCalledWith(event, 'set-cookie', cookies[0])
    expect(append).toHaveBeenCalledWith(event, 'set-cookie', cookies[1])
    expect(api.mock.calls[0][1].headers.get('cookie')).toContain(
      'access_token=old;',
    )
    expect(api.mock.calls[1][1].headers.get('cookie')).toBe(
      'access_token=new; refresh_token=new-refresh; preference=dark',
    )
    expect(api.mock.calls[2][1].headers.get('cookie')).toBe(
      api.mock.calls[1][1].headers.get('cookie'),
    )
    expect(headers.cookie).toContain('access_token=old;')
  })
})

it('shares rotation with requests sent while refresh is pending', async () => {
  const client = setup()
  const rotation = deferred<unknown>()
  const started = deferred<void>()
  const late = deferred<unknown>()
  raw.mockImplementationOnce(() => {
    started.resolve()
    return rotation.promise
  })
  api
    .mockRejectedValueOnce(unauthorized)
    .mockImplementationOnce(() => late.promise)
    .mockResolvedValue({})
  const first = client('/one')
  await started.promise
  const second = client('/two')
  rotation.resolve({ headers: { getSetCookie: () => [] } })
  await first
  late.reject(unauthorized)
  await second
  expect(raw).toHaveBeenCalledTimes(1)
})
