import { expect, it } from 'vitest'

import { useWeekCreateDialog } from '@/modules/weeks/composables/useWeekCreateDialog'

it('shares writable create-dialog state across consumers', () => {
  const first = useWeekCreateDialog()
  const second = useWeekCreateDialog()
  expect(first.isOpen.value).toBe(false)
  first.open()
  first.open()
  expect(second.isOpen.value).toBe(true)
  second.isOpen.value = false
  expect(first.isOpen.value).toBe(false)
  second.open()
  first.close()
  first.close()
  expect(second.isOpen.value).toBe(false)
})
