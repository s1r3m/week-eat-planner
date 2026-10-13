/* eslint-disable camelcase -- API schemas use snake_case fields. */
import type { UserData } from '@/modules/auth/types'
import type { WeekFull } from '@/modules/weeks/types'

export const user: UserData = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'tester',
  is_active: true,
  avatar_url: null,
  oauth_provider: null,
}

export const week = (id = 'week-1', name = 'Week one'): WeekFull => ({
  id,
  name,
  user_id: user.id,
  week_days: [],
})
