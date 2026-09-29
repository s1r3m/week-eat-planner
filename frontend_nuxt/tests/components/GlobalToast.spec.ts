import { expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'

import { useGlobalToast } from '@/common/composables/useGlobalToast'
import GlobalToast from '@/common/ui/GlobalToast.vue'

import { mountComposable } from '../helpers/composable'

it('connects rendered notifications to one timer owner and manual dismissal', async () => {
  vi.useFakeTimers()
  const { result: toast, wrapper } = mountComposable(useGlobalToast, {
    render: () => h(GlobalToast),
    stubs: { Teleport: true, TransitionGroup: true, Icon: true },
  })
  toast.show('Saved', 'success', 1000)
  await nextTick()
  expect(wrapper.text()).toContain('Saved')
  expect(vi.getTimerCount()).toBe(1)
  await vi.advanceTimersByTimeAsync(1000)
  await nextTick()
  expect(wrapper.text()).not.toContain('Saved')
  toast.show('Dismiss me')
  await nextTick()
  await wrapper.get('button').trigger('click')
  expect(toast.toasts.value).toEqual([])
  expect(vi.getTimerCount()).toBe(0)
})
