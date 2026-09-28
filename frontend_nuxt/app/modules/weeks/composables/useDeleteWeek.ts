import type { WeekPreview } from '@/modules/weeks/types'

import { useGlobalToast } from '@/common/composables/useGlobalToast'
import { useWeeksApi } from '@/modules/weeks/api/weeksApi'
import { WEEKS_KEY } from '@/modules/weeks/constants'

export const useDeleteWeek = () => {
  const weeksApi = useWeeksApi()
  const queryCache = useQueryCache()
  const { show } = useGlobalToast()

  return useMutation({
    mutation: weeksApi.delete,
    onMutate: async (id: string) => {
      await queryCache.cancelQueries({ key: WEEKS_KEY.all() })
      await queryCache.cancelQueries({ key: WEEKS_KEY.single(id) })
      const previous = queryCache.getQueryData<WeekPreview[]>(WEEKS_KEY.all())
      queryCache.setQueryData(WEEKS_KEY.all(), (weeks: WeekPreview[] = []) =>
        weeks.filter((week) => week.id !== id),
      )
      return { previous }
    },
    onError: (error, _id, context) => {
      if (context?.previous) {
        queryCache.setQueryData(WEEKS_KEY.all(), context.previous)
      }
      show(error.message)
    },
    onSettled: (_response, _error, id, _context) => {
      queryCache.invalidateQueries({ key: WEEKS_KEY.all() })
      queryCache.invalidateQueries({ key: WEEKS_KEY.single(id) })
    },
  })
}
