import type { RouteLocationRaw } from 'vue-router'

export interface NavLink {
  icon?: string
  id: string
  title: string
  to: RouteLocationRaw
  inactive?: boolean
  child?: NavLink[]
}
