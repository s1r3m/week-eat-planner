import { flushPromises } from '@vue/test-utils'
import { beforeEach, expect, it, vi } from 'vitest'

import { useCurrentUser } from '@/modules/auth/composables/useCurrentUser'
import { useLogin } from '@/modules/auth/composables/useLogin'
import { useLogout } from '@/modules/auth/composables/useLogout'
import { useSignup } from '@/modules/auth/composables/useSignup'
import { AUTH_KEY } from '@/modules/auth/constants'
import { useWeeks } from '@/modules/weeks/composables/useWeeks'
import { WEEKS_KEY } from '@/modules/weeks/constants'

import { mountComposable } from '../../helpers/composable'
import { user, week } from '../../helpers/fixtures'

const api = vi.fn()
beforeEach(() => {
  api.mockReset()
  vi.stubGlobal('useNuxtApp', () => ({ $api: api }))
})

it('login refreshes the active user query after successful authentication', async () => {
  const nextUser = { ...user, username: 'Updated' }
  api.mockResolvedValue(nextUser)
  const { result, cache } = mountComposable(
    () => ({ login: useLogin(), current: useCurrentUser() }),
    {
      seed: (cache) => cache.setQueryData(AUTH_KEY.user(), user),
    },
  )
  expect(api).not.toHaveBeenCalled()
  await result.login.mutateAsync({
    username: user.email,
    password: 'password123',
  })
  expect(api.mock.calls.map(([path]) => path)).toEqual(['/auth/login', '/user'])
  expect(cache.getQueryData(AUTH_KEY.user())).toEqual(nextUser)
})

it('logout clears the user and refetches active weeks with the existing behavior', async () => {
  api.mockImplementation(async (path) => (path === '/weeks' ? [] : null))
  const { result, cache } = mountComposable(
    () => ({ logout: useLogout(), weeks: useWeeks() }),
    {
      seed: (cache) => {
        cache.setQueryData(AUTH_KEY.user(), user)
        cache.setQueryData(WEEKS_KEY.all(), [week()])
      },
    },
  )
  await result.logout.mutateAsync()
  await flushPromises()
  expect(api.mock.calls.map(([path]) => path)).toEqual([
    '/auth/logout',
    '/weeks',
  ])
  expect(cache.getQueryData(AUTH_KEY.user())).toBeNull()
  expect(result.weeks.data.value).toEqual([])
})

it.each([
  [
    'login',
    () => useLogin(),
    { username: user.email, password: 'password123' },
  ],
  [
    'signup',
    () => useSignup(),
    { email: user.email, username: user.username, password: 'password123' },
  ],
] as const)(
  '%s exposes request errors and finishes loading',
  async (_name, composable, payload) => {
    const error = new Error('offline')
    api.mockRejectedValue(error)
    const { result, cache } = mountComposable<
      ReturnType<typeof useLogin> | ReturnType<typeof useSignup>
    >(composable, {
      seed: (cache) => cache.setQueryData(AUTH_KEY.user(), user),
    })
    // Both payloads intentionally include all fields needed by either mutation.
    await expect(
      result.mutateAsync({
        ...payload,
        username: user.username,
        email: user.email,
      }),
    ).rejects.toBe(error)
    expect(result.isLoading.value).toBe(false)
    expect(result.error.value).toBe(error)
    expect(cache.getQueryData(AUTH_KEY.user())).toEqual(user)
  },
)

it('failed logout preserves the user and weeks cache', async () => {
  const error = new Error('offline')
  api.mockRejectedValue(error)
  const { result, cache } = mountComposable(useLogout, {
    seed: (cache) => {
      cache.setQueryData(AUTH_KEY.user(), user)
      cache.setQueryData(WEEKS_KEY.all(), [week()])
    },
  })
  await expect(result.mutateAsync()).rejects.toBe(error)
  expect(cache.getQueryData(AUTH_KEY.user())).toEqual(user)
  expect(cache.getQueryData(WEEKS_KEY.all())).toEqual([week()])
  expect(api).toHaveBeenCalledExactlyOnceWith('/auth/logout', {
    method: 'POST',
  })
})
