export interface IWeekPayload {
	name: string
}

export interface IWeekPreview {
	id: string
	name: string
	user_id: string
}

export const useWeeksApi = () => {
	const { $api } = useNuxtApp()

	return {
		createWeek: (body: IWeekPayload) =>
			$api('/weeks', { body, method: 'POST' }),
		deleteWeek: (weekId: string) =>
			$api(`/weeks/${weekId}`, { method: 'DELETE' }),
		getWeeks: () => $api<IWeekPreview[]>('/weeks'),
	}
}
