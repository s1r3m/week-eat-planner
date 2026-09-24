import type {
  LoginPayload,
  SignupPayload,
  SuccessResponse,
  UserData,
} from '@/modules/auth/types'

export const useAuthApi = () => {
  const { $api } = useNuxtApp()

  return {
    create: (body: SignupPayload) =>
      $api<UserData>('/auth/signup', { method: 'POST', body }),
    getUser: () => $api<UserData>('/user'),
    login: (body: LoginPayload) =>
      $api<UserData>('/auth/login', {
        method: 'POST',
        body: new URLSearchParams({
          username: body.username,
          password: body.password,
        }),
      }),
    logout: () => $api<SuccessResponse>('/auth/logout', { method: 'POST' }),
  }
}
