import { expect, it } from 'vitest'

import { useSidebar } from '@/common/composables/useSidebar'
import { useMobileSidebar } from '@/modules/main/composables/useMobileSidebar'
import { useWeekCreateDialog } from '@/modules/weeks/composables/useWeekCreateDialog'

it('shares mobile open/close state without changing other controls', () => {
  const first = useMobileSidebar()
  const second = useMobileSidebar()
  expect(first.isOpen.value).toBe(false)
  first.open()
  first.open()
  expect(second.isOpen.value).toBe(true)
  expect(useSidebar().collapsed.value).toBe(false)
  expect(useWeekCreateDialog().isOpen.value).toBe(false)
  second.close()
  second.close()
  expect(first.isOpen.value).toBe(false)
  first.isOpen.value = true
  expect(second.isOpen.value).toBe(true)
})
