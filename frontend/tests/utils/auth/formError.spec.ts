import { expect, it } from 'vitest'

import { getFormErrorMessage } from '@/modules/auth/utils/formError'

it('uses a nonempty server detail', () => {
  expect(
    getFormErrorMessage({ data: { detail: 'Email already exists' } }),
  ).toBe('Email already exists')
})

it.each([
  undefined,
  null,
  'error',
  new Error('offline'),
  {},
  { data: null },
  { data: {} },
  { data: { detail: '' } },
  { data: { detail: [] } },
])('falls back for malformed errors: %j', (error) => {
  expect(getFormErrorMessage(error)).toBe('Something went wrong')
})
