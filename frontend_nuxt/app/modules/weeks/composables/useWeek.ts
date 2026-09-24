import { WEEKS_KEY } from '@/modules/weeks/constants'
import { useWeeksApi } from '~/modules/weeks/api/weeksApi'

export const useWeek = (weekId: string) => {
  const weeksApi = useWeeksApi()

  return useQuery({
    key: WEEKS_KEY.single(weekId),
    query: () => weeksApi.getWeek(toValue(weekId)),
  })
}
