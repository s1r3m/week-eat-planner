export const useWeeksApi = () => {
	const { $api } = useNuxtApp()

	return {
		createWeek: async (body: IWeekPayload) => {
			await new Promise((resolve) => setTimeout(resolve, 2000))
			return $api<IWeekPreview>('/weeks', { body, method: 'POST' })
		},
		deleteWeek: (weekId: string) =>
			$api<undefined>(`/weeks/${weekId}`, { method: 'DELETE' }),
		getWeeks: async () => {
			await new Promise((resolve) => setTimeout(resolve, 2000))
			return $api<IWeekPreview[]>('/weeks')
		},
	}
}
