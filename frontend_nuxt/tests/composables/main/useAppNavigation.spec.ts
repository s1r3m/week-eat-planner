import { flushPromises } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'

import { useAppNavigation } from '@/modules/main/composables/useAppNavigation'
import { WEEKS_KEY } from '@/modules/weeks/constants'

import { mountComposable } from '../../helpers/composable'
import { week } from '../../helpers/fixtures'

it('updates links when the weeks query or its cache changes', async () => {
  const response = Promise.withResolvers<ReturnType<typeof week>[]>()
  vi.stubGlobal('useNuxtApp', () => ({ $api: vi.fn(() => response.promise) }))
  const { result, cache } = mountComposable(useAppNavigation)
  expect(result.navLinks.value).toEqual([
    {
      id: '1',
      title: 'My Weeks',
      icon: 'lucide:calendar-days',
      to: { name: 'my-weeks' },
      child: undefined,
    },
    {
      id: '2',
      title: 'My Recipes',
      icon: 'lucide:utensils',
      to: { name: 'my-recipes' },
    },
  ])
  response.resolve([week()])
  await flushPromises()
  expect(result.navLinks.value[0]!.child).toEqual([
    {
      id: 'week-1',
      title: 'Week one',
      to: { name: 'weeks-id', params: { id: 'week-1' } },
    },
  ])
  cache.setQueryData(WEEKS_KEY.all(), [week('new', 'Renamed')])
  expect(result.navLinks.value[0]!.child?.[0]?.title).toBe('Renamed')
  cache.setQueryData(WEEKS_KEY.all(), [])
  expect(result.navLinks.value[0]!.child).toEqual([])
})
