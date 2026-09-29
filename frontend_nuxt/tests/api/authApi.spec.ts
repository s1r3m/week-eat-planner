import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthApi } from '@/modules/auth/api/authApi'

import { stubGlobals } from '../helpers/globals'

const api = vi.fn()

beforeEach(() => {
  api.mockReset()
  stubGlobals({
    useNuxtApp: () => ({ $api: api }),
  })
})

describe('useAuthApi.logout', () => {
  it('posts to the logout endpoint and returns the response', async () => {
    api.mockResolvedValue(null)

    expect(await useAuthApi().logout()).toBeNull()
    expect(api).toHaveBeenCalledTimes(1)
    expect(api).toHaveBeenCalledWith('/auth/logout', { method: 'POST' })
  })

  it('propagates logout failures to the caller', async () => {
    const error = new Error('Network error')
    api.mockRejectedValue(error)

    await expect(useAuthApi().logout()).rejects.toBe(error)
    expect(api).toHaveBeenCalledTimes(1)
  })
})
