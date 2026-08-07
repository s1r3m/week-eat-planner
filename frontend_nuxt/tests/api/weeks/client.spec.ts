import { describe, expect, it, mock } from 'bun:test'
import { useWeeksApi } from '@/api/weeks/client'

const mockApi = mock()
// Mock useNuxtApp globally for tests
// @ts-ignore
globalThis.useNuxtApp = () => ({
	$api: mockApi,
})

describe('useWeeksApi', () => {
	const weeksApi = useWeeksApi()

	describe('createWeek', () => {
		it('calls the /weeks endpoint with POST method and JSON body', async () => {
			const payload = { name: 'New Week' }
			const mockResponse = { id: '1', name: 'New Week', user_id: 'user1' }
			mockApi.mockResolvedValue(mockResponse)

			const result = await weeksApi.createWeek(payload)

			expect(mockApi).toHaveBeenCalledWith('/weeks', {
				body: payload,
				method: 'POST',
			})
			expect(result).toEqual(mockResponse)
		})
	})

	describe('deleteWeek', () => {
		it('calls the /weeks/:id endpoint with DELETE method', async () => {
			const weekId = '123'
			mockApi.mockResolvedValue(undefined)

			await weeksApi.deleteWeek(weekId)

			expect(mockApi).toHaveBeenCalledWith(`/weeks/${weekId}`, {
				method: 'DELETE',
			})
		})
	})

	describe('getWeeks', () => {
		it('calls the /weeks endpoint with GET method', async () => {
			const mockResponse = [{ id: '1', name: 'Week 1', user_id: 'user1' }]
			mockApi.mockResolvedValue(mockResponse)

			const result = await weeksApi.getWeeks()

			expect(mockApi).toHaveBeenCalledWith('/weeks')
			expect(result).toEqual(mockResponse)
		})
	})
})
