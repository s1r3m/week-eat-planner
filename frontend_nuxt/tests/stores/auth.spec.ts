import { beforeEach, expect, it } from 'bun:test'
import { api, clear, reset, unauthorized, deferred } from '../helpers/auth'
const { useAuthStore } = await import('@/modules/auth/stores/auth')
beforeEach(reset)
const user = { id: '1', username: 'test', email: 'test@example.com' }
it('initializes anonymous sessions once', async () => {
  api.mockRejectedValue(unauthorized)
  const store = useAuthStore()
  await store.init()
  await store.init()
  expect(api).toHaveBeenCalledTimes(1)
  expect(store.isInitialized).toBe(true)
  expect(store.isAuthenticated).toBe(false)
})
it('shares initialization and retries transient failures', async () => {
  const pending = deferred<unknown>()
  api.mockImplementationOnce(() => pending.promise)
  const store = useAuthStore()
  const a = store.init()
  const b = store.init()
  expect(api).toHaveBeenCalledTimes(1)
  const results = Promise.allSettled([a, b])
  pending.reject(new Error('offline'))
  expect((await results).map((result) => result.status)).toEqual([
    'rejected',
    'rejected',
  ])
  expect(store.isInitialized).toBe(false)
  api.mockResolvedValue(user)
  await store.init()
  expect(store.user).toEqual(user)
})
it('sends form-encoded login and loads the user', async () => {
  api.mockResolvedValueOnce({}).mockResolvedValueOnce(user)
  const store = useAuthStore()
  await store.login({ username: user.email, password: 'secret' })
  expect(api.mock.calls[0][1].body.toString()).toBe(
    'username=test%40example.com&password=secret',
  )
  expect(api.mock.calls[1]).toEqual(['/user', { skipSessionHandling: true }])
  expect(store.user).toEqual(user)
})
it('uses signup response directly', async () => {
  api.mockResolvedValue(user)
  const store = useAuthStore()
  await store.signup({
    username: 'test',
    email: user.email,
    password: 'secret',
  })
  expect(api).toHaveBeenCalledTimes(1)
  expect(store.user).toEqual(user)
  expect(store.isInitialized).toBe(true)
})
it('propagates login and signup errors', async () => {
  api.mockRejectedValue(unauthorized)
  const store = useAuthStore()
  await expect(
    store.login({ username: user.email, password: 'bad' }),
  ).rejects.toEqual(unauthorized)
  await expect(
    store.signup({ username: 'test', email: user.email, password: 'bad' }),
  ).rejects.toEqual(unauthorized)
  expect(store.isLoading).toBe(false)
})
it('rejects login if user fetch cannot establish a session', async () => {
  api.mockResolvedValueOnce({}).mockRejectedValueOnce(unauthorized)
  await expect(
    useAuthStore().login({ username: user.email, password: 'secret' }),
  ).rejects.toThrow('Unable to establish')
})
it.each([undefined, unauthorized])(
  'clears local auth after successful or unauthorized logout',
  async (error) => {
    const store = useAuthStore()
    store.user = user as any
    if (error) api.mockRejectedValue(error)
    await store.logout()
    expect(store.user).toBeNull()
    expect(clear).toHaveBeenCalledTimes(1)
    expect(api).toHaveBeenCalledWith('/auth/logout', {
      method: 'POST',
      skipSessionHandling: true,
    })
  },
)
it('retains auth and propagates logout outages', async () => {
  const store = useAuthStore()
  store.user = user as any
  api.mockRejectedValue(new Error('offline'))
  await expect(store.logout()).rejects.toThrow('offline')
  expect(store.user).toEqual(user)
  expect(clear).not.toHaveBeenCalled()
})
it('does not restore a user from a fetch completed after logout', async () => {
  const pending = deferred<unknown>()
  api.mockImplementationOnce(() => pending.promise)
  const store = useAuthStore()
  const fetch = store.fetchUser()
  store.clearSession()
  pending.resolve(user)
  await fetch
  expect(store.user).toBeNull()
})
