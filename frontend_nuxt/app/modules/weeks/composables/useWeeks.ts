import { useWeeksApi } from '@/modules/weeks/api/weeksApi'
import { WEEKS_KEY } from '@/modules/weeks/constants'

export const useWeeks = () => {
  const weeksApi = useWeeksApi()

  return useQuery({
    key: WEEKS_KEY.all(),
    query: weeksApi.getAll,
  })
}
