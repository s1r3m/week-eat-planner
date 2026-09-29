import { expect, it } from 'vitest'
import { isReadonly } from 'vue'

import { useGlobalToast } from '@/common/composables/useGlobalToast'

it('shares notifications, defaults, and unique IDs across consumers', () => {
  const first = useGlobalToast()
  const second = useGlobalToast()
  expect(first.toasts.value).toEqual([])
  expect(isReadonly(first.toasts)).toBe(true)
  first.show('Failed')
  second.show('Saved', 'success', 1000)
  expect(first.toasts.value).toEqual([
    { id: 0, message: 'Failed', variant: 'error', duration: 5000 },
    { id: 1, message: 'Saved', variant: 'success', duration: 1000 },
  ])
  second.dismiss(0)
  second.dismiss(999)
  first.show('Another')
  expect(second.toasts.value.map((toast) => toast.id)).toEqual([1, 2])
})
