import type {
  WeekCreatePayload,
  WeekFull,
  WeekPreview,
} from '@/modules/weeks/types'

import { useGlobalToast } from '@/common/composables/useGlobalToast'
import { useAuth } from '@/modules/auth/composables/useAuth'
import { WEEKS_KEY } from '@/modules/weeks/constants'

export const getWeeks = defineQueryOptions(() => {
  const { $api } = useNuxtApp()

  return {
    key: WEEKS_KEY.all(),
    query: () => $api<WeekPreview[]>('/weeks'),
  }
})

export const getWeekQuery = defineQueryOptions((weekId: string) => {
  const { $api } = useNuxtApp()

  return {
    key: WEEKS_KEY.single(weekId),
    query: () => $api<WeekFull>(`/weeks/${weekId}`),
    ssrCatchError: true,
  }
})

export const createWeekMutation = defineMutation(() => {
  const { $api } = useNuxtApp()
  const { show } = useGlobalToast()
  const { getResolvedUser } = useAuth()
  const queryCache = useQueryCache()

  return useMutation({
    mutation: (body: WeekCreatePayload) =>
      $api<WeekPreview>('/weeks', { method: 'POST', body }),
    onMutate: async (body: WeekCreatePayload) => {
      const user = await getResolvedUser()
      if (!user) throw new Error('User must be defined at this stage!')

      queryCache.cancelQueries({ key: WEEKS_KEY.all() })
      const temporaryWeek: WeekPreview = {
        id: crypto.randomUUID(),
        user_id: user.id,
        name: body.name,
      }
      queryCache.setQueryData(WEEKS_KEY.all(), (weeks: WeekPreview[] = []) => [
        ...weeks,
        temporaryWeek,
      ])
      return { temporaryWeek }
    },
    onSuccess: (createdWeek, _body, { temporaryWeek }) => {
      if (temporaryWeek) {
        queryCache.setQueryData(WEEKS_KEY.all(), (weeks: WeekPreview[] = []) =>
          weeks.map((week) =>
            week.id === temporaryWeek.id ? createdWeek : week,
          ),
        )
      }
    },
    onError: (error, _body, { temporaryWeek }) => {
      if (temporaryWeek) {
        queryCache.setQueryData(WEEKS_KEY.all(), (weeks: WeekPreview[] = []) =>
          weeks.filter((week) => week.id !== temporaryWeek.id),
        )
      }
      show(error.message)
    },
    onSettled: () => {
      queryCache.invalidateQueries({ key: WEEKS_KEY.all() })
    },
  })
})

export const deleteWeekMutation = defineMutation(() => {
  const { $api } = useNuxtApp()
  const queryCache = useQueryCache()

  return useMutation({
    mutation: (weekId: string) =>
      $api<null>(`/weeks/${weekId}`, { method: 'DELETE' }),
    onMutate: (weekId: string) => {
      Promise.all([
        queryCache.cancelQueries({ key: WEEKS_KEY.all() }),
        queryCache.cancelQueries({ key: WEEKS_KEY.single(weekId) }),
      ])
      const removedWeek = queryCache
        .getQueryData<WeekPreview[]>(WEEKS_KEY.all())
        ?.find((week) => week.id === weekId)
      if (!removedWeek) throw new Error('Week to delete was not found.')

      queryCache.setQueryData(WEEKS_KEY.all(), (weeks: WeekPreview[] = []) =>
        weeks.filter((week) => week.id !== weekId),
      )
      return { removedWeek }
    },
    onError: (_error, _weekId, { removedWeek }) => {
      if (removedWeek) {
        queryCache.setQueryData(
          WEEKS_KEY.all(),
          (weeks: WeekPreview[] = []) => [...weeks, removedWeek],
        )
      }
    },
    onSettled: (_response, _error, weekId) => {
      Promise.all([
        queryCache.cancelQueries({ key: WEEKS_KEY.all() }),
        queryCache.cancelQueries({ key: WEEKS_KEY.single(weekId) }),
      ])
    },
  })
})
