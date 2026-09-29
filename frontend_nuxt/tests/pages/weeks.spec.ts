import { flushPromises } from '@vue/test-utils'
import { beforeEach, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'

import PageEmptyState from '@/common/ui/PageEmptyState.vue'
import PageErrorState from '@/common/ui/PageErrorState.vue'
import PageLoadingState from '@/common/ui/PageLoadingState.vue'
import { useWeeks } from '@/modules/weeks/composables/useWeeks'
import { WEEKS_KEY } from '@/modules/weeks/constants'
import WeekGrid from '@/modules/weeks/ui/WeekGrid.vue'
import WeeksPage from '@/pages/my/weeks.vue'

import { mountComposable } from '../helpers/composable'
import { week } from '../helpers/fixtures'
import { uiStubs } from '../helpers/ui'

const api = vi.fn()
beforeEach(() => {
  api.mockReset()
  vi.stubGlobal('useNuxtApp', () => ({ $api: api }))
})

function setup() {
  return mountComposable(useWeeks, {
    render: () => h(WeeksPage),
    stubs: { ...uiStubs, WeekCreateDialog: true },
  })
}

it('shows only the initial loader and retains populated and empty grids during refresh', async () => {
  const initial = Promise.withResolvers<ReturnType<typeof week>[]>()
  api.mockReturnValueOnce(initial.promise)
  const { result, cache, wrapper } = setup()
  expect(wrapper.findComponent(PageLoadingState).exists()).toBe(true)
  expect(wrapper.findComponent(WeekGrid).exists()).toBe(false)
  initial.resolve([week()])
  await flushPromises()
  expect(wrapper.findComponent(PageLoadingState).exists()).toBe(false)
  expect(wrapper.text()).toContain('Week one')
  for (const data of [[week()], []]) {
    cache.setQueryData(WEEKS_KEY.all(), data)
    await nextTick()
    const response = Promise.withResolvers<ReturnType<typeof week>[]>()
    api.mockReturnValueOnce(response.promise)
    const request = result.refetch(true)
    await nextTick()
    expect(wrapper.findComponent(PageLoadingState).exists()).toBe(false)
    expect(wrapper.getComponent(WeekGrid).props('weeks')).toEqual(data)
    expect(wrapper.findComponent(PageEmptyState).exists()).toBe(
      data.length === 0,
    )
    response.resolve(data)
    await request
  }
})

it('keeps the empty state after optimistically deleting the last week', async () => {
  api.mockResolvedValueOnce([week()])
  const { result, cache, wrapper } = setup()
  await flushPromises()
  cache.setQueryData(WEEKS_KEY.all(), [])
  const response = Promise.withResolvers<ReturnType<typeof week>[]>()
  api.mockReturnValueOnce(response.promise)
  const request = result.refetch(true)
  await nextTick()
  expect(wrapper.findComponent(PageEmptyState).exists()).toBe(true)
  expect(wrapper.findComponent(PageLoadingState).exists()).toBe(false)
  response.resolve([])
  await request
})

it('keeps the error-first behavior even when cached weeks are available', async () => {
  api.mockResolvedValueOnce([week()])
  const { result, wrapper } = setup()
  await flushPromises()
  const error = new Error('offline')
  api.mockRejectedValueOnce(error)
  await result.refetch()
  await nextTick()
  expect(wrapper.getComponent(PageErrorState).props('error')).toBe(error)
  expect(wrapper.findComponent(WeekGrid).exists()).toBe(false)
  api.mockResolvedValueOnce([])
  await wrapper.getComponent(PageErrorState).get('button').trigger('click')
  await flushPromises()
  expect(wrapper.findComponent(PageErrorState).exists()).toBe(false)
  expect(wrapper.findComponent(PageEmptyState).exists()).toBe(true)
})
