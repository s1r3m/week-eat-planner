import type { WeekCreatePayload, WeekPreview } from '@/modules/weeks/types'

import { useGlobalToast } from '@/common/composables/useGlobalToast'
import { useCurrentUser } from '@/modules/auth/composables/useCurrentUser'
import { useWeeksApi } from '@/modules/weeks/api/weeksApi'
import { WEEKS_KEY } from '@/modules/weeks/constants'

export const useCreateWeek = () => {
  const weeksApi = useWeeksApi()
  const queryCache = useQueryCache()
  const { refresh } = useCurrentUser()
  const { show } = useGlobalToast()

  return useMutation({
    mutation: weeksApi.create,
    onMutate: async (body: WeekCreatePayload) => {
      const { data: user } = await refresh(true)
      if (!user) throw new Error('User is required to create a week')

      queryCache.cancelQueries({ key: WEEKS_KEY.all() })
      const creatingWeek: WeekPreview = {
        id: crypto.randomUUID(),
        name: body.name,
        // eslint-disable-next-line camelcase
        user_id: user.id,
      }
      queryCache.setQueryData(WEEKS_KEY.all(), (weeks: WeekPreview[] = []) => [
        ...weeks,
        creatingWeek,
      ])

      return { creatingWeek }
    },
    onSuccess: (createdWeek, _body, { creatingWeek }) => {
      queryCache.setQueryData(WEEKS_KEY.all(), (weeks: WeekPreview[] = []) =>
        weeks.map((week) => (week.id === creatingWeek.id ? createdWeek : week)),
      )
    },
    onError: (error, _body, { creatingWeek }) => {
      if (creatingWeek) {
        queryCache.setQueryData(WEEKS_KEY.all(), (weeks: WeekPreview[] = []) =>
          weeks.filter((week) => week.id !== creatingWeek.id),
        )
      }
      show(error.message)
    },
    onSettled: () =>
      Promise.allSettled([
        queryCache.invalidateQueries({ key: WEEKS_KEY.all() }),
      ]),
  })
}
