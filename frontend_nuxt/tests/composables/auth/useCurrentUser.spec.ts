import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useCurrentUser } from '@/modules/auth/composables/useCurrentUser'
import { AUTH_KEY } from '@/modules/auth/constants'

import { mountComposable } from '../../helpers/composable'
import { user } from '../../helpers/fixtures'

const api = vi.fn()
beforeEach(() => {
  api.mockReset()
  vi.stubGlobal('useNuxtApp', () => ({ $api: api }))
})

describe('useCurrentUser', () => {
  it('fetches and shares the current user', async () => {
    api.mockResolvedValue(user)
    const { result, cache } = mountComposable(() => [
      useCurrentUser(),
      useCurrentUser(),
    ])
    await flushPromises()
    expect(api).toHaveBeenCalledExactlyOnceWith('/user')
    expect(result[0]!.data.value).toEqual(user)
    expect(result[1]!.data.value).toEqual(user)
    expect(cache.getQueryData(AUTH_KEY.user())).toEqual(user)
  })

  it('returns null for unauthorized users', async () => {
    api.mockRejectedValue({ status: 401 })
    const { result } = mountComposable(useCurrentUser)
    await flushPromises()
    expect(result.data.value).toBeNull()
    expect(result.error.value).toBeNull()
  })

  it('retains other errors and propagates an explicitly throwing refetch', async () => {
    const error = new Error('offline')
    api.mockRejectedValue(error)
    const { result } = mountComposable(useCurrentUser)
    await flushPromises()
    expect(result.error.value).toBe(error)
    await expect(result.refetch(true)).rejects.toBe(error)
  })
})
