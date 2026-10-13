import {
	defineMutation,
	defineQuery,
	defineQueryOptions,
	useMutation,
	useQuery,
	useQueryCache,
} from '@pinia/colada'
import { afterEach, beforeEach, vi } from 'vitest'
import {
	computed,
	onMounted,
	onServerPrefetch,
	onUnmounted,
	readonly,
	ref,
	toValue,
	useId,
	watch,
} from 'vue'

import { cleanupComposables } from './helpers/composable'
import { cleanupAppContexts } from './helpers/context'
import { createNuxtState } from './helpers/nuxtState'

// Query factories are evaluated when modules are imported, before test hooks run.
vi.stubGlobal('defineQuery', defineQuery)
vi.stubGlobal('defineQueryOptions', defineQueryOptions)
vi.stubGlobal('defineMutation', defineMutation)

beforeEach(() => {
	const globals = {
		defineQuery,
		defineQueryOptions,
		defineMutation,
		computed,
		onMounted,
		onServerPrefetch,
		onUnmounted,
		readonly,
		ref,
		toValue,
		useId,
		watch,
		useMutation,
		useQuery,
		useQueryCache,
		useState: createNuxtState(),
		definePageMeta: vi.fn(),
		navigateTo: vi.fn(),
	}
	for (const [name, value] of Object.entries(globals)) {
		vi.stubGlobal(name, value)
	}
})

afterEach(() => {
	cleanupComposables()
	cleanupAppContexts()
	vi.useRealTimers()
	vi.unstubAllGlobals()
})
