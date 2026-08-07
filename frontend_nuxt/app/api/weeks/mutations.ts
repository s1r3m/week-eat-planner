export const addWeekMutation = defineMutation(() => {
	const queryCache = useQueryCache()

	return {
		mutation: (payload: IWeekPayload) => useWeeksApi().createWeek(payload),
		onMutate: (payload: IWeekPayload) => {
			queryCache.cancelQueries({ key: WEEK_KEYS.all() })
			const previousWeeks =
				queryCache.getQueryData<IWeekPreview[]>(WEEK_KEYS.all()) || []
			queryCache.setQueryData(WEEK_KEYS.all(), (old: IWeekPreview[] = []) => [
				...old,
				{
					id: `temp-id-${crypto.randomUUID()}`,
					user_id: 'temp-obj', // Consider adding a user to add to
					...payload,
					__pending: true,
				},
			])
			return { previousWeeks }
		},
		onError: (
			error: Error,
			payload: IWeekPayload,
			context: { previousWeeks?: IWeekPreview[] },
		) => {
			console.error(
				`An error occurred while creating new week ${payload.name}: ${error.message}`,
			)
			if (context?.previousWeeks)
				queryCache.setQueryData(WEEK_KEYS.all(), context.previousWeeks)
		},
		onSuccess: (week: IWeekPreview) => {
			console.log(`Week ${week.name} created successfully`)
		},
		onSettled: () => queryCache.invalidateQueries({ key: WEEK_KEYS.all() }),
	}
})

export const deleteWeekMutation = defineMutation(() => {
	const queryCache = useQueryCache()

	return {
		mutation: (id: string) => useWeeksApi().deleteWeek(id),
		onMutate: (id: string) => {
			queryCache.cancelQueries({ key: WEEK_KEYS.all() })
			const previousWeeks =
				queryCache.getQueryData<IWeekPreview[]>(WEEK_KEYS.all()) || []
			queryCache.setQueryData(WEEK_KEYS.all(), (old: IWeekPreview[] = []) =>
				old.filter((week: IWeekPreview) => week.id !== id),
			)
			return { previousWeeks }
		},
		onError: (
			error: Error,
			_id: string,
			context?: { previousWeeks?: IWeekPreview[] },
		) => {
			if (context?.previousWeeks)
				queryCache.setQueryData(WEEK_KEYS.all(), context.previousWeeks)
			console.error(`Failed to delete week: ${error.message}`)
		},
		onSuccess: () => console.log(`Week deleted successfully`),
		onSettled: (
			_: undefined,
			_error: Error | undefined,
			id: string,
			_context: { previousWeeks?: IWeekPreview[] },
		) => {
			queryCache.invalidateQueries({ key: WEEK_KEYS.all() })
			queryCache.invalidateQueries({ key: WEEK_KEYS.detail(id) })
		},
	}
})
