import type { NavLink } from '@/modules/main/types'

import { getWeeks } from '@/modules/weeks/api/weeksApi'

export const useAppNavigation = () => {
	const { data: weeks } = useQuery(getWeeks())

	const navLinks = computed<NavLink[]>(() => [
		{
			child: weeks.value?.map((week) => ({
				id: week.id,
				title: week.name,
				to: { name: 'weeks-id', params: { id: week.id } },
			})),
			icon: 'lucide:calendar-days',
			id: '1',
			title: 'My Weeks',
			to: { name: 'my-weeks' },
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
