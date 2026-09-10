import { beforeEach, expect, it } from 'bun:test'
import { api, navigate, reset, unauthorized } from '../../helpers/auth'
import { getRedirectTarget, isPublicRoute } from '@/modules/auth/utils/session'
const guard = (await import('@/core/router/middleware/auth.global'))
  .default as any
beforeEach(reset)
it.each(['/', '/login', '/signup', '/weeks/abc'])(
  'allows public route %s without login loops',
  async (path) => {
    api.mockRejectedValue(unauthorized)
    await guard({ path, fullPath: path })
    expect(navigate).not.toHaveBeenCalled()
    expect(isPublicRoute(path)).toBe(true)
  },
)
it('redirects protected routes with their query and hash', async () => {
  api.mockRejectedValue(unauthorized)
  await guard({ path: '/my/weeks', fullPath: '/my/weeks?q=1#week' })
  expect(navigate).toHaveBeenCalledWith({
    path: '/login',
    query: { redirect: '/my/weeks?q=1#week' },
  })
})
it('allows authenticated navigation', async () => {
  api.mockResolvedValue({ id: '1' })
  await guard({ path: '/my/weeks', fullPath: '/my/weeks' })
  expect(navigate).not.toHaveBeenCalled()
})
it('reports protected initialization outages as 503', async () => {
  api.mockRejectedValue(new Error('offline'))
  expect(await guard({ path: '/my/weeks' })).toMatchObject({ statusCode: 503 })
  expect(navigate).not.toHaveBeenCalled()
})
it('allows public pages during initialization outages', async () => {
  api.mockRejectedValue(new Error('offline'))
  expect(await guard({ path: '/weeks/abc' })).toBeUndefined()
})
it.each([
  undefined,
  '//evil.test',
  '/\\evil.test',
  'https://evil.test',
  '/\n/evil.test',
  ['/my/weeks'],
])('rejects unsafe redirect %j', (value) => {
  expect(getRedirectTarget(value)).toBe('/my/weeks')
})
it('preserves safe internal return URLs', () => {
  expect(getRedirectTarget('/my/recipes?q=1#item')).toBe('/my/recipes?q=1#item')
  expect(isPublicRoute('/weeks/a/edit')).toBe(false)
})

it('initializes through the dependent plugin and avoids repeat middleware fetches', async () => {
  const plugin = (await import('@/plugins/authInit')).default as any
  const keys = new Set<string>()
  Object.assign(globalThis, {
    callOnce: async (key: string, fn: () => Promise<void>) => {
      if (!keys.has(key)) {
        await fn()
        keys.add(key)
      }
    },
  })
  api.mockRejectedValue(unauthorized)
  await plugin.setup()
  await plugin.setup()
  await guard({ path: '/login', fullPath: '/login' })
  expect(plugin.dependsOn).toEqual(['base-api'])
  expect(keys.has('auth:init')).toBe(true)
  expect(api).toHaveBeenCalledTimes(1)
})
