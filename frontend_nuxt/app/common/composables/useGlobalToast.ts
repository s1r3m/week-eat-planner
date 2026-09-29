import type { AlertVariant, Toast } from '@/common/types'

export const useGlobalToast = () => {
  const toasts = useState<Toast[]>('toast:list', () => [])
  const nextId = useState('toast:nextId', () => 0)

  const show = (
    message: string,
    variant: AlertVariant = 'error',
    duration = 5000,
  ) => {
    const id = nextId.value++
    toasts.value = [...toasts.value, { duration, id, message, variant }]
  }

  const dismiss = (id: number) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { dismiss, show, toasts: readonly(toasts) }
}
