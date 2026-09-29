import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { WeekFull, WeekPreview } from '@/modules/weeks/types'

import { useGlobalToast } from '@/common/composables/useGlobalToast'
import { AUTH_KEY } from '@/modules/auth/constants'
import { useCreateWeek } from '@/modules/weeks/composables/useCreateWeek'
import { useWeeks } from '@/modules/weeks/composables/useWeeks'
import { WEEKS_KEY } from '@/modules/weeks/constants'

import { mountComposable } from '../../helpers/composable'
import { user, week } from '../../helpers/fixtures'

const api = vi.fn()
const created = week('created', 'New')
beforeEach(() => {
  api.mockReset()
  vi.stubGlobal('useNuxtApp', () => ({ $api: api }))
})

function setup(initial: undefined | WeekPreview[]) {
  const response = Promise.withResolvers<WeekFull>()
  const started = Promise.withResolvers<void>()
  api.mockImplementation(() => {
    started.resolve()
    return response.promise
  })
  const harness = mountComposable(useCreateWeek, {
    seed: (cache) => {
      cache.setQueryData(AUTH_KEY.user(), user)
      if (initial !== undefined) cache.setQueryData(WEEKS_KEY.all(), initial)
    },
  })
  return { ...harness, response, started }
}

describe('useCreateWeek', () => {
  it.each([undefined, [], [week()]])(
    'optimistically creates with initial cache %j',
    async (initial) => {
      const { result, cache, response, started } = setup(initial)
      const cancel = vi.spyOn(cache, 'cancelQueries')
      const invalidate = vi.spyOn(cache, 'invalidateQueries')
      const request = result.mutateAsync({ name: 'New' })
      await started.promise
      expect(result.isLoading.value).toBe(true)
      const optimistic = cache.getQueryData<WeekPreview[]>(WEEKS_KEY.all())!
      expect(optimistic.slice(0, -1)).toEqual(initial ?? [])
      expect(optimistic.at(-1)).toMatchObject({ name: 'New' })
      expect(optimistic.at(-1)!.user_id).toBe(user.id)
      expect(optimistic.at(-1)!.id).not.toBe(created.id)
      expect(cancel).toHaveBeenCalledWith({ key: WEEKS_KEY.all() })
      expect(api).toHaveBeenCalledExactlyOnceWith('/weeks', {
        method: 'POST',
        body: { name: 'New' },
      })
      response.resolve(created)
      await expect(request).resolves.toEqual(created)
      expect(cache.getQueryData(WEEKS_KEY.all())).toEqual([
        ...(initial ?? []),
        created,
      ])
      expect(invalidate).toHaveBeenCalledWith({ key: WEEKS_KEY.all() })
      expect(result.isLoading.value).toBe(false)
      expect(useGlobalToast().toasts.value).toEqual([])
    },
  )

  it.each([undefined, [], [week()]])(
    'rolls back failure with the current cache behavior: %j',
    async (initial) => {
      const { result, cache, response, started } = setup(initial)
      const error = new Error('Creation failed')
      const request = result.mutateAsync({ name: 'New' })
      const failure = expect(request).rejects.toBe(error)
      await started.promise
      response.reject(error)
      await failure
      expect(cache.getQueryData(WEEKS_KEY.all())).toEqual(initial ?? [])
      expect(result.isLoading.value).toBe(false)
      expect(useGlobalToast().toasts.value).toMatchObject([
        { message: error.message },
      ])
    },
  )

  it('removes the optimistic entry when another update is present', async () => {
    const { result, cache, response, started } = setup(undefined)
    const error = new Error('offline')
    const failure = expect(result.mutateAsync({ name: 'New' })).rejects.toBe(
      error,
    )
    await started.promise
    const current = cache.getQueryData<WeekPreview[]>(WEEKS_KEY.all())!
    cache.setQueryData(WEEKS_KEY.all(), [...current, week('other')])
    response.reject(error)
    await failure
    expect(cache.getQueryData(WEEKS_KEY.all())).toEqual([week('other')])
  })

  it('uses an empty list when a cleared cache is handled on failure', async () => {
    const { result, cache, response, started } = setup([week()])
    const error = new Error('offline')
    const failure = expect(result.mutateAsync({ name: 'New' })).rejects.toBe(
      error,
    )
    await started.promise
    cache.setQueryData(WEEKS_KEY.all(), undefined)
    response.reject(error)
    await failure
    expect(cache.getQueryData(WEEKS_KEY.all())).toEqual([])
  })

  it.each(['missing', 'replaced', 'already present'] as const)(
    'maps success only when the temporary entry is present: %s',
    async (change) => {
      const { result, cache, response, started } = setup([week()])
      const request = result.mutateAsync({ name: 'New' })
      await started.promise
      cache.setQueryData(
        WEEKS_KEY.all(),
        change === 'missing'
          ? undefined
          : change === 'replaced'
            ? [week()]
            : [week(), created],
      )
      response.resolve(created)
      await request
      expect(cache.getQueryData(WEEKS_KEY.all())).toEqual(
        change === 'missing'
          ? []
          : change === 'replaced'
            ? [week()]
            : [week(), created],
      )
    },
  )

  it('requires a user before touching the list or sending a POST', async () => {
    const { result, cache } = setup([week()])
    cache.setQueryData(AUTH_KEY.user(), null)
    await expect(result.mutateAsync({ name: 'New' })).rejects.toThrow(
      'User is required',
    )
    expect(api).not.toHaveBeenCalled()
    expect(cache.getQueryData(WEEKS_KEY.all())).toEqual([week()])
    expect(useGlobalToast().toasts.value).toHaveLength(1)
  })

  it('propagates a failed user refresh despite cached user data', async () => {
    const { result, cache } = setup([week()])
    const error = new Error('Session check failed')
    await cache.invalidateQueries({ key: AUTH_KEY.user() }, false)
    api.mockRejectedValue(error)
    await expect(result.mutateAsync({ name: 'New' })).rejects.toBe(error)
    expect(api).toHaveBeenCalledExactlyOnceWith('/user')
    expect(cache.getQueryData(WEEKS_KEY.all())).toEqual([week()])
    expect(useGlobalToast().toasts.value).toMatchObject([
      { message: error.message },
    ])
  })

  it('cancels an older list response and reconciles with the post-mutation refetch', async () => {
    const old = Promise.withResolvers<WeekPreview[]>()
    const response = Promise.withResolvers<WeekFull>()
    api.mockImplementation((path, options) =>
      options?.method === 'POST'
        ? response.promise
        : Promise.resolve([week(), created]),
    )
    const { result, cache } = mountComposable(
      () => ({ create: useCreateWeek(), list: useWeeks() }),
      {
        seed: (cache) => {
          cache.setQueryData(AUTH_KEY.user(), user)
          cache.setQueryData(WEEKS_KEY.all(), [week()])
        },
      },
    )
    api.mockReturnValueOnce(old.promise)
    const previousRequest = result.list.refetch(true)
    const request = result.create.mutateAsync({ name: 'New' })
    await flushPromises()
    old.resolve([])
    await previousRequest
    expect(cache.getQueryData<WeekPreview[]>(WEEKS_KEY.all())).toHaveLength(2)
    response.resolve(created)
    await request
    expect(result.list.data.value).toEqual([week(), created])
  })

  it('preserves successful creation when the subsequent list refresh fails', async () => {
    const error = new Error('Refetch failed')
    api.mockImplementation((_path, options) =>
      options?.method === 'POST'
        ? Promise.resolve(created)
        : Promise.reject(error),
    )
    const { result } = mountComposable(
      () => ({ create: useCreateWeek(), list: useWeeks() }),
      {
        seed: (cache) => {
          cache.setQueryData(AUTH_KEY.user(), user)
          cache.setQueryData(WEEKS_KEY.all(), [])
        },
      },
    )
    await expect(result.create.mutateAsync({ name: 'New' })).resolves.toEqual(
      created,
    )
    expect(result.create.status.value).toBe('success')
    expect(result.create.isLoading.value).toBe(false)
    expect(result.list.error.value).toBe(error)
    expect(result.list.data.value).toEqual([created])
    expect(useGlobalToast().toasts.value).toEqual([])
  })
})
