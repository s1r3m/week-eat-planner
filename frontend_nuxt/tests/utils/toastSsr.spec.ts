import { expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'

import { useGlobalToast } from '@/common/composables/useGlobalToast'
import { useToastAutoDismiss } from '@/common/composables/useToastAutoDismiss'

it('does not create timers during server rendering', async () => {
  vi.useFakeTimers()
  const toast = useGlobalToast()
  toast.show('Server notification')
  await renderToString(
    createSSRApp(
      defineComponent({
        setup() {
          useToastAutoDismiss(toast.toasts, toast.dismiss)
          return () => null
        },
      }),
    ),
  )
  expect(vi.getTimerCount()).toBe(0)
  await vi.advanceTimersByTimeAsync(10_000)
  expect(toast.toasts.value).toHaveLength(1)
})
