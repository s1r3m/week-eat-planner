import type { WeekPreview } from '@/modules/weeks/types'

type SelectedWeek = Pick<WeekPreview, 'id' | 'name'>

export const useWeekDeleteDialog = () => {
  const week = useState<null | SelectedWeek>(
    'week-delete-dialog:week',
    () => null,
  )
  const isOpen = useState<boolean>('week-delete-dialog:isOpen', () => false)

  const open = ({ id, name }: SelectedWeek) => {
    week.value = { id, name }
    isOpen.value = true
  }

  const close = () => {
    week.value = null
    isOpen.value = false
  }

  return { close, isOpen, open, week: readonly(week) }
}
