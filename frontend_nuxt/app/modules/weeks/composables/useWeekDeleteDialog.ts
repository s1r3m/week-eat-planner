import type { WeekFull } from '@/modules/weeks/types'

export const useWeekDeleteDialog = () => {
  const isOpen = useState<boolean>('week-delete-dialog:isOpen', () => false)
  const week = useState<null | WeekFull>('week-delete-dialog:week', () => null)

  const open = (w: WeekFull) => {
    week.value = w
    isOpen.value = true
  }

  const close = () => {
    week.value = null
    isOpen.value = false
  }

  return { close, isOpen, open, week }
}
