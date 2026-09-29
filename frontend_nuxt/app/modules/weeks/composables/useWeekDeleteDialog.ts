import type { WeekPreview } from '@/modules/weeks/types'

type SelectedWeek = Pick<WeekPreview, 'id' | 'name'>

export const useWeekDeleteDialog = () => {
  const week = useState<null | SelectedWeek>(
    'week-delete-dialog:week',
    () => null,
  )
  const isOpen = computed({
    get: () => week.value !== null,
    set: (value: boolean) => {
      if (!value) close()
    },
  })

  const open = ({ id, name }: SelectedWeek) => {
    week.value = { id, name }
  }

  const close = () => {
    week.value = null
  }

  return { close, isOpen, open, week: readonly(week) }
}
