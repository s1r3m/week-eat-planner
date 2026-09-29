import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { WeekPreview } from '@/modules/weeks/types'

import { useGlobalToast } from '@/common/composables/useGlobalToast'
import { useDeleteWeek } from '@/modules/weeks/composables/useDeleteWeek'
import { useWeek } from '@/modules/weeks/composables/useWeek'
import { useWeeks } from '@/modules/weeks/composables/useWeeks'
import { WEEKS_KEY } from '@/modules/weeks/constants'

import { mountComposable } from '../../helpers/composable'
import { week } from '../../helpers/fixtures'

const api = vi.fn()
beforeEach(() => {
  api.mockReset()
  vi.stubGlobal('useNuxtApp', () => ({ $api: api }))
})

function setup(initial: undefined | WeekPreview[]) {
  const response = Promise.withResolvers<null>()
  const started = Promise.withResolvers<void>()
  api.mockImplementation(() => {
    started.resolve()
    return response.promise
  })
  const harness = mountComposable(useDeleteWeek, {
    seed: (cache) => {
      if (initial !== undefined) cache.setQueryData(WEEKS_KEY.all(), initial)
    },
  })
  return { ...harness, response, started }
}

describe('useDeleteWeek', () => {
  it.each([undefined, [], [week('other')], [week(), week('other')]])(
    'deletes from the cached list: %j',
    async (initial) => {
      const { result, cache, response, started } = setup(initial)
      const cancel = vi.spyOn(cache, 'cancelQueries')
      const invalidate = vi.spyOn(cache, 'invalidateQueries')
      const request = result.mutateAsync('week-1')
      await started.promise
      expect(result.isLoading.value).toBe(true)
      expect(cache.getQueryData(WEEKS_KEY.all())).toEqual(
        (initial ?? []).filter((item) => item.id !== 'week-1'),
      )
      expect(cancel).toHaveBeenCalledWith({ key: WEEKS_KEY.all() })
      expect(cancel).toHaveBeenCalledWith({ key: WEEKS_KEY.single('week-1') })
      expect(api).toHaveBeenCalledExactlyOnceWith('/weeks/week-1', {
        method: 'DELETE',
      })
      response.resolve(null)
      await request
      expect(result.isLoading.value).toBe(false)
      expect(invalidate).toHaveBeenCalledWith({ key: WEEKS_KEY.all() })
      expect(invalidate).toHaveBeenCalledWith({
        key: WEEKS_KEY.single('week-1'),
      })
      expect(useGlobalToast().toasts.value).toEqual([])
    },
  )

  it.each([
    undefined,
    [],
    [week('other')],
    [week('before'), week(), week('after')],
  ])('rolls back a failed deletion: %j', async (initial) => {
    const { result, cache, response, started } = setup(initial)
    const error = new Error('Delete failed')
    const failure = expect(result.mutateAsync('week-1')).rejects.toBe(error)
    await started.promise
    response.reject(error)
    await failure
    expect(cache.getQueryData(WEEKS_KEY.all())).toEqual(initial ?? [])
    expect(result.isLoading.value).toBe(false)
    expect(useGlobalToast().toasts.value).toMatchObject([
      { message: error.message },
    ])
  })

  it.each(['changed', 'missing', 'already restored'] as const)(
    'restores the optimistic snapshot during rollback: %s',
    async (change) => {
      const { result, cache, response, started } = setup([week()])
      const error = new Error('offline')
      const failure = expect(result.mutateAsync('week-1')).rejects.toBe(error)
      await started.promise
      const current =
        change === 'changed'
          ? [week('other')]
          : change === 'missing'
            ? undefined
            : [week('week-1', 'Updated')]
      cache.setQueryData(WEEKS_KEY.all(), current)
      response.reject(error)
      await failure
      expect(cache.getQueryData(WEEKS_KEY.all())).toEqual(
        change === 'changed'
          ? [week()]
          : change === 'missing'
            ? [week()]
            : [week()],
      )
    },
  )

  it('keeps deletion successful when list and deleted-detail refetches fail', async () => {
    const error = new Error('Not found')
    api.mockImplementation((_path, options) =>
      options?.method === 'DELETE'
        ? Promise.resolve(null)
        : Promise.reject(error),
    )
    const { result } = mountComposable(
      () => ({
        remove: useDeleteWeek(),
        list: useWeeks(),
        detail: useWeek('week-1'),
      }),
      {
        seed: (cache) => {
          cache.setQueryData(WEEKS_KEY.all(), [week()])
          cache.setQueryData(WEEKS_KEY.single('week-1'), week())
        },
      },
    )
    await expect(result.remove.mutateAsync('week-1')).resolves.toBeNull()
    expect(result.remove.status.value).toBe('success')
    expect(result.remove.isLoading.value).toBe(false)
    expect(result.list.data.value).toEqual([])
    expect(result.list.error.value).toBe(error)
    expect(result.detail.error.value).toBe(error)
    expect(useGlobalToast().toasts.value).toEqual([])
  })

  it('shows an error without restoring a missing snapshot', () => {
    type MutationOptions = {
      onError: (
        error: Error,
        id: string,
        context: { previous?: WeekPreview[] },
      ) => void
    }
    const mutation = vi.fn((_options: MutationOptions) => ({}))
    vi.stubGlobal('useMutation', mutation)
    const { cache } = mountComposable(useDeleteWeek)
    const setQueryData = vi.spyOn(cache, 'setQueryData')
    const error = new Error('Delete failed')
    const call = mutation.mock.calls.at(0)

    if (!call) throw new Error('useMutation was not called')

    call[0].onError(error, 'week-1', {})

    expect(setQueryData).not.toHaveBeenCalled()
    expect(useGlobalToast().toasts.value).toMatchObject([
      { message: error.message },
    ])
  })
})
