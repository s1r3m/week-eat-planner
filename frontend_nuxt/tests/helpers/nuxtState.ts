import { ref, type Ref } from 'vue'

export function createNuxtState() {
  const state = new Map<string, Ref>()
  return <T>(key: string, init: () => T): Ref<T> => {
    if (!state.has(key)) state.set(key, ref(init()))
    return state.get(key) as Ref<T>
  }
}
