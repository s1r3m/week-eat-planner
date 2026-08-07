import { describe, expect, it, mock } from 'bun:test'
import { WEEK_KEYS } from '@/api/weeks/keys'

const mockGetWeeks = mock()

// Set globals for the source file to use.
// @ts-ignore
globalThis.WEEK_KEYS = WEEK_KEYS
// @ts-ignore
globalThis.useWeeksApi = () => ({
	getWeeks: mockGetWeeks,
})
// @ts-ignore
globalThis.defineQueryOptions = (fn) => fn()

// We use dynamic import because defineQueryOptions and other globals are used at top level.
const { getWeeksQuery } = (await import('@/api/weeks/queries')) as unknown as {
	getWeeksQuery: {
		key: readonly string[]
		query: () => Promise<any>
	}
}

describe('getWeeksQuery', () => {
	it('WEEK_KEYS.shoppingList returns correct key', () => {
		expect(WEEK_KEYS.shoppingList('123')).toEqual([
			'weeks',
			'shopping-list',
			'123',
		])
	})

	it('defines the query with correct key and query function', async () => {
		expect(getWeeksQuery.key).toEqual(['weeks', 'list'])

		const mockData = [{ id: '1', name: 'Week 1' }]
		mockGetWeeks.mockResolvedValue(mockData)

		const result = await getWeeksQuery.query()
		expect(mockGetWeeks).toHaveBeenCalled()
		expect(result).toEqual(mockData)
	})
})
