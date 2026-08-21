import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { WEEK_KEYS } from '@/api/weeks/keys'

const mockGetWeeks = mock()
const mockGetWeek = mock()

beforeEach(() => {
	mockGetWeeks.mockClear()
	mockGetWeek.mockClear()
})

// Set globals for the source file to use.
// @ts-ignore
globalThis.WEEK_KEYS = WEEK_KEYS
// @ts-ignore
globalThis.useWeeksApi = () => ({
	getWeeks: mockGetWeeks,
	getWeek: mockGetWeek,
})
// @ts-ignore
globalThis.defineQueryOptions = (fn) => {
	const f = (...args: any[]) => fn(...args)
	// Add key and query methods for testing convenience
	f.key = (id: string) => fn(id).key
	f.query = (id: string) => fn(id).query
	return f
}

// We use dynamic import because defineQueryOptions and other globals are used at top level.
const { getWeeksQuery, getWeekQuery } =
	(await import('@/api/weeks/queries')) as any

describe('getWeeksQuery', () => {
	it('defines the query with correct key', () => {
		expect(getWeeksQuery().key).toEqual(WEEK_KEYS.all())
	})

	it('defines the query with correct function', async () => {
		const mockData = [{ id: '1', name: 'Week 1' }]
		mockGetWeeks.mockResolvedValue(mockData)

		const result = await getWeeksQuery().query()

		expect(mockGetWeeks).toHaveBeenCalled()
		expect(result).toEqual(mockData)
	})
})

describe('getWeekQuery', () => {
	it('defines the query with correct key', () => {
		const weekId = '123-123-1432'
		expect(getWeekQuery(weekId).key).toEqual(WEEK_KEYS.detail(weekId))
	})

	it('defines the query with correct function', async () => {
		const mockData = [{ id: '1', name: 'Week 1', week_days: [] }]
		mockGetWeek.mockResolvedValue(mockData)

		const result = await getWeekQuery('123').query()

		expect(mockGetWeek).toHaveBeenCalledWith('123')
		expect(result).toEqual(mockData)
	})
})
