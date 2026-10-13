import { vi } from 'vitest'

export function stubGlobals(values: Record<string, unknown>) {
  for (const [name, value] of Object.entries(values)) vi.stubGlobal(name, value)
}
