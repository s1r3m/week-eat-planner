export type AlertVariant = 'error' | 'success'

export interface Toast {
  duration: number
  id: number
  message: string
  variant: AlertVariant
}
