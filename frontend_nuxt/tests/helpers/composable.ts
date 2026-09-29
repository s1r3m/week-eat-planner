import { PiniaColada, useQueryCache } from '@pinia/colada'
import { mount } from '@vue/test-utils'
import { createPinia, disposePinia } from 'pinia'
import { afterEach } from 'vitest'
import { type Component, defineComponent, type VNode } from 'vue'

const cleanups: (() => void)[] = []
afterEach(() => {
  for (const cleanup of cleanups.toReversed()) cleanup()
  cleanups.length = 0
})

export function mountComposable<T>(
  setup: () => T,
  options: {
    render?: () => null | VNode
    seed?: (cache: ReturnType<typeof useQueryCache>) => void
    stubs?: Record<string, boolean | Component>
  } = {},
) {
  const pinia = createPinia()
  let result!: T
  let cache!: ReturnType<typeof useQueryCache>
  const wrapper = mount(
    defineComponent({
      setup() {
        cache = useQueryCache()
        options.seed?.(cache)
        result = setup()
        return options.render ?? (() => null)
      },
    }),
    {
      global: {
        plugins: [
          pinia,
          [
            PiniaColada,
            {
              queryOptions: {
                staleTime: Infinity,
                gcTime: Infinity,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
              },
              mutationOptions: { gcTime: Infinity },
            },
          ],
        ],
        stubs: options.stubs,
      },
    },
  )
  cleanups.push(() => {
    wrapper.unmount()
    disposePinia(pinia)
  })
  return { result, cache, wrapper }
}
