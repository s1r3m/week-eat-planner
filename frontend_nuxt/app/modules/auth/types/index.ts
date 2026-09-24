import type { components } from '#open-fetch-schemas/base-api'

export type LoginPayload = Pick<
  components['schemas']['Body_login_auth_login_post'],
  'password' | 'username'
>
export type SignupPayload = components['schemas']['UserCreate']
export type SuccessResponse = components['schemas']['SuccessResponse']
export type UserData = components['schemas']['UserRead']
export type ValidationError = components['schemas']['ValidationError']
