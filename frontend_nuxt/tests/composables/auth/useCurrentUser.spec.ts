import { beforeEach, describe, expect, it, mock } from 'bun:test'

const mockApi = mock()

Object.assign(globalThis, {
  useNuxtApp: () => ({ $api: mockApi }),
  useQuery: (options: unknown) => options,
})

const { useCurrentUser } =
  await import('@/modules/auth/composables/useCurrentUser')

describe('useCurrentUser', () => {
  beforeEach(() => {
    mockApi.mockReset()
  })

  it('returns null for unauthorized users', async () => {
    mockApi.mockRejectedValue({ status: 401 })

    const { query } = useCurrentUser() as unknown as {
      query: () => Promise<unknown>
    }

    expect(await query()).toBeNull()
  })

  it('rethrows errors other than unauthorized', async () => {
    const error = new Error('offline')
    mockApi.mockRejectedValue(error)

    const { query } = useCurrentUser() as unknown as {
      query: () => Promise<unknown>
    }

    await expect(query()).rejects.toBe(error)
  })
})
