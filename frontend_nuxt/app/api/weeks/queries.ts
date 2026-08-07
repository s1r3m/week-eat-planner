export const getWeeksQuery = defineQueryOptions(() => ({
	key: WEEK_KEYS.all(),
	query: () => useWeeksApi().getWeeks(),
}))
