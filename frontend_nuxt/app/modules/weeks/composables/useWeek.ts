import { useWeeksApi } from '@/modules/weeks/composables/weeksApi'
import { WEEKS_KEY } from '@/modules/weeks/constants'

export const useWeek = (weekId: string) => {
  const { getWeek } = useWeeksApi()

  return useQuery({
    key: WEEKS_KEY.single(weekId),
    query: () => getWeek(toValue(weekId)),
  })
}
