import { useWeeksApi } from '@/modules/weeks/composables/weeksApi'
import { WEEKS_KEY } from '@/modules/weeks/constants'

export const useWeeks = () => {
  const { getAll } = useWeeksApi()

  return useQuery({
    key: WEEKS_KEY.all(),
    query: getAll,
  })
}
