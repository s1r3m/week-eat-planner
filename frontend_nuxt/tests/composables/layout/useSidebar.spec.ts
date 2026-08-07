import { describe, expect, it, mock } from 'bun:test'
import { useSidebar } from '@/composables/layout/useSidebar'
import { ref } from 'vue'

// Mock useState
// @ts-ignore
globalThis.useState = (_key: string, init: () => any) => {
	return ref(init ? init() : false)
}

// Mock readonly
// @ts-ignore
globalThis.readonly = (val: any) => val

describe('useSidebar', () => {
	it('initializes with default value', () => {
		const { collapsed } = useSidebar()
		expect(collapsed.value).toBe(false)
	})

	it('toggles collapsed state', () => {
		const { collapsed, toggleCollapsed } = useSidebar()
		expect(collapsed.value).toBe(false)

		toggleCollapsed()
		expect(collapsed.value).toBe(true)

		toggleCollapsed()
		expect(collapsed.value).toBe(false)
	})
})
