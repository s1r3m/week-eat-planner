import { flushPromises } from '@vue/test-utils'
import { beforeEach, expect, it, vi } from 'vitest'
import { h } from 'vue'

import PageErrorState from '@/common/ui/PageErrorState.vue'
import { AUTH_KEY } from '@/modules/auth/constants'
import { useWeekDeleteDialog } from '@/modules/weeks/composables/useWeekDeleteDialog'
import { WEEKS_KEY } from '@/modules/weeks/constants'
import WeekDetail from '@/pages/weeks/[id].vue'

import { mountComposable } from '../helpers/composable'
import { user, week } from '../helpers/fixtures'
import { uiStubs } from '../helpers/ui'

const api = vi.fn()
beforeEach(() => {
	api.mockReset()
	vi.stubGlobal('useNuxtApp', () => ({ $api: api }))
	vi.stubGlobal('useRoute', () => ({ params: { id: 'week-1' } }))
})

it('loads the detail, shows owner controls, and passes the selected week to deletion confirmation', async () => {
	const response = Promise.withResolvers<ReturnType<typeof week>>()
	api.mockReturnValue(response.promise)
	const { result, wrapper, cache } = mountComposable(useWeekDeleteDialog, {
		render: () => h(WeekDetail),
		stubs: { ...uiStubs, WeekDeleteDialog: true },
		seed: (cache) => cache.setQueryData(AUTH_KEY.user(), user),
	})
	expect(wrapper.get('.loading-state').text()).toContain('Loading weeks')
	response.resolve(week())
	await flushPromises()
	expect(wrapper.get('h2').text()).toBe('Week one')
	await wrapper.get('button[aria-label="Delete week"]').trigger('click')
	expect(result.isOpen.value).toBe(true)
	expect(result.week.value).toEqual({ id: 'week-1', name: 'Week one' })
	cache.setQueryData(AUTH_KEY.user(), null)
	await flushPromises()
	expect(wrapper.find('button[aria-label="Delete week"]').exists()).toBe(false)
	expect(wrapper.get('h2').text()).toBe('Week one')
	expect(cache.getQueryData(WEEKS_KEY.single('week-1'))).toEqual(week())
})

it('shows an initial error and retries the detail query', async () => {
	api
		.mockRejectedValueOnce(new Error('Not found'))
		.mockResolvedValueOnce(week())
	const { wrapper } = mountComposable(() => null, {
		render: () => h(WeekDetail),
		stubs: { ...uiStubs, WeekDeleteDialog: true },
		seed: (cache) => cache.setQueryData(AUTH_KEY.user(), null),
	})
	await flushPromises()
	expect(wrapper.getComponent(PageErrorState).text()).toContain('Not found')
	await wrapper.getComponent(PageErrorState).get('button').trigger('click')
	await flushPromises()
	expect(wrapper.findComponent(PageErrorState).exists()).toBe(false)
	expect(wrapper.get('h2').text()).toBe('Week one')
	expect(api).toHaveBeenCalledTimes(2)
})
