export interface IWeekPreview {
	id: string
	name: string
	user_id: string
}

export const useWeeksApi = () => {
	const { $api } = useNuxtApp()

	return {
		getWeeks: () => $api<IWeekPreview[]>('/weeks'),
	}
}
