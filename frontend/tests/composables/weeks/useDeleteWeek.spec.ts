import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { WeekPreview } from '@/modules/weeks/types'

import {
	deleteWeekMutation,
	getWeekQuery,
	getWeeks,
} from '@/modules/weeks/api/weeksApi'
import { WEEKS_KEY } from '@/modules/weeks/constants'

import { mountComposable } from '../../helpers/composable'
import { week } from '../../helpers/fixtures'

const api = vi.fn()
beforeEach(() => {
	api.mockReset()
	vi.stubGlobal('useNuxtApp', () => ({ $api: api }))
})

function setup(initial: undefined | WeekPreview[]) {
	const response = Promise.withResolvers<null>()
	api.mockReturnValue(response.promise)
	const harness = mountComposable(deleteWeekMutation, {
		seed: (cache) => {
			if (initial !== undefined) cache.setQueryData(WEEKS_KEY.all(), initial)
		},
	})
	return { ...harness, response }
}

describe('deleteWeekMutation', () => {
	it.each([undefined, [], [week('other')]].map((initial) => ({ initial })))(
		'rejects a missing week before sending DELETE: $initial',
		async ({ initial }) => {
			const { result, cache } = setup(initial)
			await expect(result.mutateAsync('week-1')).rejects.toThrow(
				'Week to delete was not found.',
			)
			expect(api).not.toHaveBeenCalled()
			expect(cache.getQueryData(WEEKS_KEY.all())).toEqual(initial)
			expect(result.isLoading.value).toBe(false)
		},
	)

	it('removes the selected week immediately and cancels list and detail requests on settlement', async () => {
		const { result, cache, response } = setup([week(), week('other')])
		const cancel = vi.spyOn(cache, 'cancelQueries')
		const invalidate = vi.spyOn(cache, 'invalidateQueries')
		const request = result.mutateAsync('week-1')
		await flushPromises()
		expect(result.isLoading.value).toBe(true)
		expect(cache.getQueryData(WEEKS_KEY.all())).toEqual([week('other')])
		expect(api).toHaveBeenCalledExactlyOnceWith('/weeks/week-1', {
			method: 'DELETE',
		})
		response.resolve(null)
		await expect(request).resolves.toBeNull()
		expect(result.isLoading.value).toBe(false)
		expect(cancel.mock.calls).toEqual([
			[{ key: WEEKS_KEY.all() }],
			[{ key: WEEKS_KEY.single('week-1') }],
			[{ key: WEEKS_KEY.all() }],
			[{ key: WEEKS_KEY.single('week-1') }],
		])
		expect(invalidate).not.toHaveBeenCalled()
	})

	it.each([undefined, [], [week('other')]].map((current) => ({ current })))(
		'restores the removed week while retaining concurrent changes: $current',
		async ({ current }) => {
			const { result, cache, response } = setup([
				week('before'),
				week(),
				week('after'),
			])
			const error = new Error('Delete failed')
			const failure = expect(result.mutateAsync('week-1')).rejects.toBe(error)
			await flushPromises()
			cache.setQueryData(WEEKS_KEY.all(), current)
			response.reject(error)
			await failure
			expect(cache.getQueryData(WEEKS_KEY.all())).toEqual([
				...(current ?? []),
				week(),
			])
			expect(result.isLoading.value).toBe(false)
			expect(result.error.value).toBe(error)
		},
	)

	it('preserves active list and detail data without issuing a refetch after deletion', async () => {
		api.mockResolvedValue(null)
		const { result } = mountComposable(
			() => ({
				remove: deleteWeekMutation(),
				list: useQuery(getWeeks()),
				detail: useQuery(getWeekQuery('week-1')),
			}),
			{
				seed: (cache) => {
					cache.setQueryData(WEEKS_KEY.all(), [week()])
					cache.setQueryData(WEEKS_KEY.single('week-1'), week())
				},
			},
		)
		await result.remove.mutateAsync('week-1')
		expect(result.list.data.value).toEqual([])
		expect(result.detail.data.value).toEqual(week())
		expect(api).toHaveBeenCalledExactlyOnceWith('/weeks/week-1', {
			method: 'DELETE',
		})
	})
})
