export const getWeeksQuery = defineQueryOptions(() => ({
	key: WEEK_KEYS.all(),
	query: () => useWeeksApi().getWeeks(),
}))

export const getWeekQuery = defineQueryOptions((id: string) => ({
	key: WEEK_KEYS.detail(id),
	query: () => useWeeksApi().getWeek(id),
}))
