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
    onMutate: (id: string) => {
      queryCache.cancelQueries({ key: WEEKS_KEY.all() })
      queryCache.cancelQueries({ key: WEEKS_KEY.single(id) })

      const weeks =
        queryCache.getQueryData<WeekPreview[]>(WEEKS_KEY.all()) || []

      queryCache.setQueryData(
        WEEKS_KEY.all(),
        weeks.filter((week) => week.id !== id),
      )
      return { previous: weeks }
    },
    onError: (error, _id, { previous }) => {
      if (previous) {
        queryCache.setQueryData(WEEKS_KEY.all(), previous)
      }
      show(error.message)
    },
    onSettled: (_response, _error, id) =>
      Promise.allSettled([
        queryCache.invalidateQueries({ key: WEEKS_KEY.all() }),
        queryCache.invalidateQueries({ key: WEEKS_KEY.single(id) }),
      ]),
  })
}
