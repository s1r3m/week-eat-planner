import { flushPromises } from '@vue/test-utils'
import { beforeEach, expect, it, vi } from 'vitest'

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

it('shares a list request and retains populated or empty data while refetching', async () => {
  const first = Promise.withResolvers<ReturnType<typeof week>[]>()
  api.mockReturnValueOnce(first.promise)
  const { result, cache } = mountComposable(() => [useWeeks(), useWeeks()])
  const query = result[0]!
  expect(query.data.value).toBeUndefined()
  expect(query.isLoading.value).toBe(true)
  first.resolve([week()])
  await flushPromises()
  expect(api).toHaveBeenCalledExactlyOnceWith('/weeks')
  expect(cache.getQueryData(WEEKS_KEY.all())).toEqual([week()])
  for (const data of [[week()], []]) {
    cache.setQueryData(WEEKS_KEY.all(), data)
    const request = Promise.withResolvers<ReturnType<typeof week>[]>()
    api.mockReturnValueOnce(request.promise)
    const loading = query.refetch(true)
    expect(query.isLoading.value).toBe(true)
    expect(query.data.value).toEqual(data)
    request.resolve(data)
    await loading
    expect(result[1]!.data.value).toEqual(data)
    expect(query.isLoading.value).toBe(false)
  }
})

it('uses separate detail cache entries for each week', async () => {
  api.mockImplementation(async (path: string) => week(path.split('/').at(-1)))
  const { result, cache } = mountComposable(() => [
    useWeek('one'),
    useWeek('two'),
  ])
  await flushPromises()
  expect(api).toHaveBeenCalledWith('/weeks/one')
  expect(api).toHaveBeenCalledWith('/weeks/two')
  expect(cache.getQueryData(WEEKS_KEY.single('one'))).toEqual(week('one'))
  expect(result[1]!.data.value).toEqual(week('two'))
})

it.each([
  ['list', () => useWeeks()],
  ['detail', () => useWeek('one')],
] as const)(
  'propagates %s query errors on explicit refetch',
  async (_name, setup) => {
    const error = new Error('offline')
    api.mockRejectedValue(error)
    const { result } = mountComposable<
      ReturnType<typeof useWeek> | ReturnType<typeof useWeeks>
    >(setup)
    await flushPromises()
    expect(result.error.value).toBe(error)
    await expect(result.refetch(true)).rejects.toBe(error)
  },
)
