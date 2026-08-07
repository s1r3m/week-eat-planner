export const useWeeksApi = () => {
	const { $api } = useNuxtApp()

	return {
		createWeek: async (body: IWeekPayload) => {
			return $api<IWeekPreview>('/weeks', { body, method: 'POST' })
		},
		deleteWeek: (weekId: string) =>
			$api<undefined>(`/weeks/${weekId}`, { method: 'DELETE' }),
		getWeeks: async () => {
			return $api<IWeekPreview[]>('/weeks')
		},
	}
}
