import { describe, expect, it, mock, beforeEach } from 'bun:test'
import { createPinia, setActivePinia } from 'pinia'
import { PiniaColada, useQueryCache, defineMutation } from '@pinia/colada'
import { createApp, effectScope } from 'vue'
import { WEEK_KEYS } from '@/api/weeks/keys'

const mockWeeksApi = {
	createWeek: mock(),
	deleteWeek: mock(),
}

// Setup globals for the source file to use
// @ts-ignore
globalThis.WEEK_KEYS = WEEK_KEYS
// @ts-ignore
globalThis.useWeeksApi = () => mockWeeksApi
// @ts-ignore
globalThis.defineMutation = defineMutation
// @ts-ignore
globalThis.useQueryCache = useQueryCache
// @ts-ignore
globalThis.useNuxtApp = () => ({})

// Define interface for the mutation options to fix TS errors
interface MutationOptions {
	mutation: (payload: any) => Promise<any>
	onMutate: (payload: any) => any
	onError: (error: Error, payload: any, context: any) => void
	onSuccess: (data: any) => void
	onSettled: (data?: any, error?: Error, payload?: any, context?: any) => void
}

// We use dynamic import because defineMutation and other globals are used at top level
const mutations = (await import('@/api/weeks/mutations')) as any
const addWeekMutationFactory = mutations.addWeekMutation
const deleteWeekMutationFactory = mutations.deleteWeekMutation

describe('Weeks Mutations', () => {
	let app: any
	let queryCache: ReturnType<typeof useQueryCache>
	let addWeekOptions: MutationOptions
	let deleteWeekOptions: MutationOptions

	beforeEach(() => {
		const pinia = createPinia()
		app = createApp({})
		app.use(pinia)
		app.use(PiniaColada)
		setActivePinia(pinia)
		queryCache = useQueryCache()

		// Get the mutation options within the app context and an effect scope to avoid warnings
		app.runWithContext(() => {
			const scope = effectScope()
			scope.run(() => {
				addWeekOptions = addWeekMutationFactory()
				deleteWeekOptions = deleteWeekMutationFactory()
			})
		})

		mockWeeksApi.createWeek.mockClear()
		mockWeeksApi.deleteWeek.mockClear()
	})

	describe('addWeekMutation', () => {
		it('calls createWeek in the mutation function', async () => {
			const payload = { name: 'New Week' }
			mockWeeksApi.createWeek.mockResolvedValue({ id: '1', ...payload })
			await addWeekOptions.mutation(payload)
			expect(mockWeeksApi.createWeek).toHaveBeenCalledWith(payload)
		})

		it('optimistically updates the cache in onMutate', () => {
			const payload = { name: 'New Week' }
			const previousWeeks = [{ id: '1', name: 'Old Week', user_id: 'u1' }]
			queryCache.setQueryData(WEEK_KEYS.all(), previousWeeks)

			const context = addWeekOptions.onMutate(payload)

			const cacheData = queryCache.getQueryData<any[]>(WEEK_KEYS.all())
			expect(cacheData).toHaveLength(2)
			expect(cacheData?.[1]).toMatchObject({
				name: 'New Week',
				__pending: true,
			})
			expect(context).toEqual({ previousWeeks })
		})

		it('rolls back the cache in onError', () => {
			const previousWeeks = [{ id: '1', name: 'Old Week', user_id: 'u1' }]
			const error = new Error('Failed')

			addWeekOptions.onError(error, { name: 'New' }, { previousWeeks })

			expect(queryCache.getQueryData<any[]>(WEEK_KEYS.all())).toEqual(
				previousWeeks,
			)
		})

		it('calls onSuccess', () => {
			// Trigger the empty onSuccess to reach 100% function coverage
			addWeekOptions.onSuccess({ id: '1', name: 'Week 1', user_id: 'u1' })
		})

		it('settles by invalidating queries', () => {
			// In Pinia Colada, we can't easily check if a query is invalidated without a spy
			// but we can check if it's marked as stale if we had a query.
			// Since we want to avoid massive mocking, we'll just check if onSettled runs without error
			// and maybe use a simple mock for invalidateQueries if we really want to check it.
			const mockInvalidate = mock()
			queryCache.invalidateQueries = mockInvalidate

			addWeekOptions.onSettled()
			expect(mockInvalidate).toHaveBeenCalledWith({ key: WEEK_KEYS.all() })
		})
	})

	describe('deleteWeekMutation', () => {
		it('calls deleteWeek in the mutation function', async () => {
			const id = '123'
			mockWeeksApi.deleteWeek.mockResolvedValue(undefined)
			await deleteWeekOptions.mutation(id)
			expect(mockWeeksApi.deleteWeek).toHaveBeenCalledWith(id)
		})

		it('optimistically updates the cache in onMutate', () => {
			const id = '1'
			const previousWeeks = [
				{ id: '1', name: 'Week 1', user_id: 'u1' },
				{ id: '2', name: 'Week 2', user_id: 'u1' },
			]
			queryCache.setQueryData(WEEK_KEYS.all(), previousWeeks)

			const context = deleteWeekOptions.onMutate(id)

			const cacheData = queryCache.getQueryData<any[]>(WEEK_KEYS.all())
			expect(cacheData).toHaveLength(1)
			expect(cacheData?.[0].id).toBe('2')
			expect(context).toEqual({ previousWeeks })
		})

		it('rolls back the cache in onError', () => {
			const id = '1'
			const previousWeeks = [{ id: '1', name: 'Week 1', user_id: 'u1' }]
			const error = new Error('Failed')

			deleteWeekOptions.onError(error, id, { previousWeeks })

			expect(queryCache.getQueryData<any[]>(WEEK_KEYS.all())).toEqual(
				previousWeeks,
			)
		})

		it('calls onSuccess', () => {
			// Trigger the empty onSuccess to reach 100% function coverage
			deleteWeekOptions.onSuccess(undefined)
		})

		it('settles by invalidating queries', () => {
			const id = '1'
			const mockInvalidate = mock()
			queryCache.invalidateQueries = mockInvalidate

			deleteWeekOptions.onSettled(undefined, undefined as any, id, {} as any)

			expect(mockInvalidate).toHaveBeenCalledWith({ key: WEEK_KEYS.all() })
			expect(mockInvalidate).toHaveBeenCalledWith({ key: WEEK_KEYS.detail(id) })
		})
	})
})
