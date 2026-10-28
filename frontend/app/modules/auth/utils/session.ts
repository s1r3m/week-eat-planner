export const isUnauthorized = (error: unknown): boolean => {
	const source = error as null | {
		response?: { status?: number }
		status?: number
		statusCode?: number
	}
	return (
		(source?.statusCode ?? source?.status ?? source?.response?.status) === 401
	)
}

export const getRedirectTarget = (value: unknown): string =>
	typeof value === 'string' &&
	value.startsWith('/') &&
	!value.startsWith('//') &&
	!value.includes('\\') &&
	[...value].every((character) => character > ' ')
		? value
		: '/my/weeks'
