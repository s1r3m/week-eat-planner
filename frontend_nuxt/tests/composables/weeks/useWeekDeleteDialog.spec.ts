import { expect, it } from 'vitest'
import { isReadonly } from 'vue'

import { useWeekDeleteDialog } from '@/modules/weeks/composables/useWeekDeleteDialog'

import { week } from '../../helpers/fixtures'

it('shares only the selected identity and clears it on close', () => {
  const first = useWeekDeleteDialog()
  const second = useWeekDeleteDialog()
  expect(first.week.value).toBeNull()
  expect(first.isOpen.value).toBe(false)
  expect(isReadonly(first.week)).toBe(true)
  first.open(week())
  expect(second.week.value).toEqual({ id: 'week-1', name: 'Week one' })
  expect(second.isOpen.value).toBe(true)
  second.open(week('week-2', 'Next'))
  expect(first.week.value).toEqual({ id: 'week-2', name: 'Next' })
  first.close()
  first.close()
  expect(second.week.value).toBeNull()
  expect(second.isOpen.value).toBe(false)
})

it('supports v-model closing without opening an empty selection', () => {
  const dialog = useWeekDeleteDialog()
  dialog.isOpen.value = true
  expect(dialog.isOpen.value).toBe(false)
  dialog.open(week())
  dialog.isOpen.value = true
  expect(dialog.isOpen.value).toBe(true)
  dialog.isOpen.value = false
  expect(dialog.week.value).toBeNull()
  expect(dialog.isOpen.value).toBe(false)
})
