import type { Ref } from 'vue'

import type { Toast } from '@/common/types'

export const useToastAutoDismiss = (
  toasts: Readonly<Ref<readonly Toast[]>>,
  dismiss: (id: number) => void,
) => {
  const timers = new Map<number, ReturnType<typeof setTimeout>>()

  onMounted(() => {
    watch(
      toasts,
      (current) => {
        const ids = new Set(current.map((toast) => toast.id))
        for (const [id, timer] of timers) {
          if (ids.has(id)) {
          	continue;
          }

          clearTimeout(timer)
          timers.delete(id)
        }
        for (const toast of current) {
          if (!timers.has(toast.id)) {
            timers.set(
              toast.id,
              setTimeout(() => dismiss(toast.id), toast.duration),
            )
          }
        }
      },
      { immediate: true },
    )
  })

  onUnmounted(() => {
    for (const timer of timers.values()) clearTimeout(timer)
    timers.clear()
  })
}
