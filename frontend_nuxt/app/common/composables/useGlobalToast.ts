import type { AlertVariant } from '@/common/types'

interface Toast {
  duration: number
  id: number
  message: string
  variant: AlertVariant
}

export const useGlobalToast = () => {
  const toasts = useState<Toast[]>('toast:list', () => [])
  const nextId = useState('toast:nextId', () => 0)

  const show = (
    message: string,
    variant: AlertVariant = 'error',
    duration = 5000,
  ) => {
    const id = nextId.value++
    toasts.value.push({ duration, id, message, variant })

    if (import.meta.client) setTimeout(() => dismiss(id), duration)
  }

  const dismiss = (id: number) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { dismiss, show, toasts }
}
