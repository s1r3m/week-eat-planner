import { expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import { useGlobalToast } from '@/common/composables/useGlobalToast'
import { useToastAutoDismiss } from '@/common/composables/useToastAutoDismiss'

import { mountComposable } from '../../helpers/composable'

it('gives pre-mount toasts their full duration and schedules new toasts independently', async () => {
  vi.useFakeTimers()
  const toast = useGlobalToast()
  toast.show('Before mount', 'success', 1000)
  await vi.advanceTimersByTimeAsync(5000)
  expect(toast.toasts.value).toHaveLength(1)
  mountComposable(() => useToastAutoDismiss(toast.toasts, toast.dismiss))
  await vi.advanceTimersByTimeAsync(500)
  toast.show('Later', 'error', 2000)
  await nextTick()
  await vi.advanceTimersByTimeAsync(499)
  expect(toast.toasts.value).toHaveLength(2)
  await vi.advanceTimersByTimeAsync(1)
  expect(toast.toasts.value.map((item) => item.message)).toEqual(['Later'])
  await vi.advanceTimersByTimeAsync(1500)
  expect(toast.toasts.value).toEqual([])
})

it('cancels manually dismissed timers and cleans up on unmount', async () => {
  vi.useFakeTimers()
  const toast = useGlobalToast()
  const dismiss = vi.fn(toast.dismiss)
  const { wrapper } = mountComposable(() =>
    useToastAutoDismiss(toast.toasts, dismiss),
  )
  toast.show('Manual')
  toast.show('Unmount')
  await nextTick()
  expect(vi.getTimerCount()).toBe(2)
  toast.dismiss(0)
  await nextTick()
  expect(vi.getTimerCount()).toBe(1)
  wrapper.unmount()
  expect(vi.getTimerCount()).toBe(0)
  toast.show('After unmount')
  await nextTick()
  await vi.advanceTimersByTimeAsync(10_000)
  expect(dismiss).not.toHaveBeenCalled()
})
