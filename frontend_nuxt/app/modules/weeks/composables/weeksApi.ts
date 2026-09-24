import type { WeekFull, WeekPreview } from '@/modules/weeks/types'

export const useWeeksApi = () => {
  const { $api } = useNuxtApp()

  return {
    getAll: () => $api<WeekPreview[]>('/weeks'),
    getWeek: (id: string) => $api<WeekFull>(`/weeks/${id}`),
  }
}
