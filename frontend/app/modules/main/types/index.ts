import type { RouteLocationRaw } from 'vue-router'

export interface NavLink {
  child?: NavLink[]
  icon?: string
  id: string
  title: string
  to: RouteLocationRaw
}
