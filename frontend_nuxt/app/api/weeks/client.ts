export const useWeeksApi = () => {
	const { $api } = useNuxtApp()

	return {
		createWeek: async (body: IWeekPayload) =>
			$api<IWeekPreview>('/weeks', { body, method: 'POST' }),
		deleteWeek: (weekId: string) =>
			$api<undefined>(`/weeks/${weekId}`, { method: 'DELETE' }),
		getWeek: async (weekId: string) => $api<IWeek>(`/weeks/${weekId}`),
		getWeeks: async () => $api<IWeekPreview[]>('/weeks'),
	}
}
