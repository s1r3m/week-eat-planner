import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import { afterEach, beforeEach, vi } from 'vitest'
import {
  computed,
  onMounted,
  onUnmounted,
  readonly,
  ref,
  toValue,
  useId,
  watch,
} from 'vue'

import { createNuxtState } from './helpers/nuxtState'

beforeEach(() => {
  const globals = {
    computed,
    onMounted,
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
  for (const [name, value] of Object.entries(globals))
    vi.stubGlobal(name, value)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})
