import { describe, expect, it, vi } from 'vitest'
import { isReadonly } from 'vue'

import { useSidebar } from '@/common/composables/useSidebar'

import { createNuxtState } from '../../helpers/nuxtState'

describe('useSidebar', () => {
  it('shares toggles across consumers and exposes readonly state', () => {
    const first = useSidebar()
    const second = useSidebar()
    expect(first.collapsed.value).toBe(false)
    expect(isReadonly(first.collapsed)).toBe(true)
    first.toggleCollapsed()
    expect(second.collapsed.value).toBe(true)
    second.toggleCollapsed()
    expect(first.collapsed.value).toBe(false)
  })

  it('isolates state between requests', () => {
    const first = useSidebar()
    first.toggleCollapsed()
    vi.stubGlobal('useState', createNuxtState())
    expect(useSidebar().collapsed.value).toBe(false)
    expect(first.collapsed.value).toBe(true)
  })
})
