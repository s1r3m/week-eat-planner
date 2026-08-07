import { describe, expect, it, mock, beforeEach } from 'bun:test'
import { WEEK_KEYS } from '@/api/weeks/keys'

const mockWeeksApi = {
	createWeek: mock(),
	deleteWeek: mock(),
}

// Mock dependencies
const mockQueryCache = {
	cancelQueries: mock(),
	getQueryData: mock(),
	setQueryData: mock(),
	invalidateQueries: mock(),
}

// Set globals for the source file to use
// @ts-ignore
globalThis.WEEK_KEYS = WEEK_KEYS
// @ts-ignore
globalThis.useWeeksApi = () => mockWeeksApi
// @ts-ignore
globalThis.defineMutation = (fn) => fn()
// @ts-ignore
globalThis.useQueryCache = () => mockQueryCache

// Define interface for the mutation object to fix TS errors
interface TestMutation {
	mutation: (payload: any) => Promise<any>
	onMutate: (payload: any) => any
	onError: (error: Error, payload: any, context: any) => void
	onSuccess: (data: any) => void
	onSettled: (data?: any, error?: Error, payload?: any, context?: any) => void
}

// We use dynamic import because defineMutation and other globals are used at top level
const mutations = (await import('@/api/weeks/mutations')) as any
const addWeekMutation = mutations.addWeekMutation as unknown as TestMutation
const deleteWeekMutation =
	mutations.deleteWeekMutation as unknown as TestMutation

describe('Weeks Mutations', () => {
	beforeEach(() => {
		mock.restore()
		mockQueryCache.cancelQueries.mockClear()
		mockQueryCache.getQueryData.mockClear()
		mockQueryCache.setQueryData.mockClear()
		mockQueryCache.invalidateQueries.mockClear()
		mockWeeksApi.createWeek.mockClear()
		mockWeeksApi.deleteWeek.mockClear()
	})

	describe('addWeekMutation', () => {
		it('calls createWeek in the mutation function', async () => {
			const payload = { name: 'New Week' }
			await addWeekMutation.mutation(payload)
			expect(mockWeeksApi.createWeek).toHaveBeenCalledWith(payload)
		})

		it('optimistically updates the cache in onMutate', () => {
			const payload = { name: 'New Week' }
			const previousWeeks = [{ id: '1', name: 'Old Week' }]
			mockQueryCache.getQueryData.mockReturnValue(previousWeeks)

			const context = addWeekMutation.onMutate(payload)

			expect(mockQueryCache.cancelQueries).toHaveBeenCalledWith({
				key: ['weeks', 'list'],
			})
			expect(mockQueryCache.setQueryData).toHaveBeenCalledWith(
				['weeks', 'list'],
				[
					...previousWeeks,
					{
						id: expect.stringMatching(/^temp-id-/),
						user_id: 'temp-obj',
						name: 'New Week',
						__pending: true,
					},
				],
			)
			expect(context).toEqual({ previousWeeks })
		})

		it('rolls back the cache in onError', () => {
			const payload = { name: 'New Week' }
			const previousWeeks = [{ id: '1', name: 'Old Week' }]
			const error = new Error('Failed')

			addWeekMutation.onError(error, payload, { previousWeeks })

			expect(mockQueryCache.setQueryData).toHaveBeenCalledWith(
				['weeks', 'list'],
				previousWeeks,
			)
		})

		it('calls onSuccess', () => {
			addWeekMutation.onSuccess({ id: '1', name: 'Week 1', user_id: 'u1' })
		})

		it('invalidates queries in onSettled', () => {
			addWeekMutation.onSettled()
			expect(mockQueryCache.invalidateQueries).toHaveBeenCalledWith({
				key: ['weeks', 'list'],
			})
		})
	})

	describe('deleteWeekMutation', () => {
		it('calls deleteWeek in the mutation function', async () => {
			const id = '123'
			await deleteWeekMutation.mutation(id)
			expect(mockWeeksApi.deleteWeek).toHaveBeenCalledWith(id)
		})

		it('optimistically updates the cache in onMutate', () => {
			const id = '1'
			const previousWeeks = [
				{ id: '1', name: 'Week 1' },
				{ id: '2', name: 'Week 2' },
			]
			mockQueryCache.getQueryData.mockReturnValue(previousWeeks)

			const context = deleteWeekMutation.onMutate(id)

			expect(mockQueryCache.cancelQueries).toHaveBeenCalledWith({
				key: ['weeks', 'list'],
			})
			expect(mockQueryCache.setQueryData).toHaveBeenCalledWith(
				['weeks', 'list'],
				[previousWeeks[1]],
			)
			expect(context).toEqual({ previousWeeks })
		})

		it('rolls back the cache in onError', () => {
			const id = '1'
			const previousWeeks = [{ id: '1', name: 'Week 1' }]
			const error = new Error('Failed')

			deleteWeekMutation.onError(error, id, { previousWeeks })

			expect(mockQueryCache.setQueryData).toHaveBeenCalledWith(
				['weeks', 'list'],
				previousWeeks,
			)
		})

		it('calls onSuccess', () => {
			deleteWeekMutation.onSuccess({})
		})

		it('invalidates queries in onSettled', () => {
			const id = '1'
			deleteWeekMutation.onSettled(undefined, undefined, id, {})
			expect(mockQueryCache.invalidateQueries).toHaveBeenCalledWith({
				key: ['weeks', 'list'],
			})
			expect(mockQueryCache.invalidateQueries).toHaveBeenCalledWith({
				key: ['weeks', 'detail', id],
			})
		})
	})
})
