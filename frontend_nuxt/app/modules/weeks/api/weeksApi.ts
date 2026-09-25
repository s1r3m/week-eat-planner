import type {
  WeekCreatePayload,
  WeekFull,
  WeekPreview,
} from '@/modules/weeks/types'

export const useWeeksApi = () => {
  const { $api } = useNuxtApp()

  return {
    create: (body: WeekCreatePayload) =>
      $api<WeekFull>('/weeks', { method: 'POST', body }),
    getAll: () => $api<WeekPreview[]>('/weeks'),
    getWeek: (id: string) => $api<WeekFull>(`/weeks/${id}`),
    delete: (id: string) => $api<null>(`/weeks/${id}`, { method: 'DELETE' }),
  }
}
