import { describe, expect, it, mock } from 'bun:test'
import { WEEK_KEYS } from '@/api/weeks/keys'

const mockGetWeeks = mock()
const mockGetWeek = mock()

// Set globals for the source file to use.
// @ts-ignore
globalThis.WEEK_KEYS = WEEK_KEYS
// @ts-ignore
globalThis.useWeeksApi = () => ({
	getWeeks: mockGetWeeks,
	getWeek: mockGetWeek,
})
// @ts-ignore
globalThis.defineQueryOptions = (fn) => fn()

// We use dynamic import because defineQueryOptions and other globals are used at top level.
const { getWeeksQuery, getWeekQuery } =
	(await import('@/api/weeks/queries')) as unknown as {
		getWeeksQuery: {
			key: readonly string[]
			query: () => Promise<any>
		}
		getWeekQuery: {
			key: readonly string[]
			query: () => Promise<any>
		}
	}

describe('getWeeksQuery', () => {
	it('defines the query with correct key', () => {
		expect(getWeeksQuery.key).toEqual(WEEK_KEYS.all())
	})

	it('defines the query with correct function', async () => {
		const mockData = [{ id: '1', name: 'Week 1' }]
		mockGetWeeks.mockResolvedValue(mockData)

		const result = await getWeeksQuery.query()

		expect(mockGetWeeks).toHaveBeenCalled()
		expect(result).toEqual(mockData)
	})
})

describe('getWeekQuery', () => {
	it('defines the query with correct key', () => {
		const weekId = '123-123-1432'
		expect(getWeekQuery.key(weekId)).toEqual(WEEK_KEYS.detail(weekId))
	})

	it('defines the query with correct function', async () => {
		const mockData = [{ id: '1', name: 'Week 1', week_days: [] }]
		mockGetWeek.mockResolvedValue(mockData)

		const result = await getWeekQuery.query()

		expect(mockGetWeek).toHaveBeenCalled()
		expect(result).toEqual(mockData)
	})
})
