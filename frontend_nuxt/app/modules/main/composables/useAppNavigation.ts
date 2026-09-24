import type { NavLink } from '@/modules/main/types'

export const useAppNavigation = () => {
  // const { data: weeks } = useQuery(getWeeksQuery())
  const weeks = ref([])

  const navLinks = computed<NavLink[]>(() => [
    {
      icon: 'lucide:calendar-days',
      id: '1',
      title: 'My Weeks',
      to: { name: 'my-weeks' },
      child: weeks.value?.map((week) => ({
        id: week.id,
        title: week.name,
        inactive: week.__pending,
        to: { name: 'weeks-id', params: { id: week.id } },
      })),
    },
    {
      icon: 'lucide:utensils',
      id: '2',
      title: 'My Recipes',
      to: { name: 'my-recipes' },
    },
  ])

  return { navLinks }
}
