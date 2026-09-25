import type { WeekCreatePayload, WeekPreview } from '@/modules/weeks/types'

import { useGlobalToast } from '@/common/composables/useGlobalToast'
import { useCurrentUser } from '@/modules/auth/composables/useCurrentUser'
import { useWeeksApi } from '@/modules/weeks/api/weeksApi'
import { WEEKS_KEY } from '@/modules/weeks/constants'

export const useCreateWeek = () => {
  const weeksApi = useWeeksApi()
  const queryCache = useQueryCache()
  const { data: user, refresh } = useCurrentUser()
  const { show } = useGlobalToast()

  return useMutation({
    mutation: weeksApi.create,
    onMutate: async (body: WeekCreatePayload) => {
      await queryCache.cancelQueries({ key: WEEKS_KEY.all() })
      await refresh()
      if (!user.value) throw new Error('User is required to create a week')

      const previous = queryCache.getQueryData<WeekPreview[]>(WEEKS_KEY.all())
      const creatingWeek: WeekPreview = {
        id: crypto.randomUUID(),
        name: body.name,
        user_id: user.value?.id,
      }
      queryCache.setQueryData(WEEKS_KEY.all(), (weeks: WeekPreview[] = []) => [
        ...weeks,
        creatingWeek,
      ])

      return { previous, creatingWeek }
    },
    onSuccess: (createdWeek, _body, context) => {
      queryCache.setQueryData(WEEKS_KEY.all(), (weeks: WeekPreview[] = []) =>
        weeks.map((week) =>
          week.id === context.creatingWeek.id ? createdWeek : week,
        ),
      )
    },
    onError: (error, _body, context) => {
      if (context?.previous) {
        queryCache.setQueryData(WEEKS_KEY.all(), context.previous)
      }
      show(error.message)
    },
    onSettled: () => {
      queryCache.invalidateQueries({ key: WEEKS_KEY.all() })
    },
  })
}
