import type {
  LoginPayload,
  SignupPayload,
  UserData,
} from '@/modules/auth/types'

export const useAuthApi = () => {
  const { $api } = useNuxtApp()

  return {
    create: (body: SignupPayload) =>
      $api<UserData>('/auth/signup', { body, method: 'POST' }),
    getUser: () => $api<UserData>('/user'),
    login: (body: LoginPayload) =>
      $api<UserData>('/auth/login', {
        body: new URLSearchParams({
          password: body.password,
          username: body.username,
        }),
        method: 'POST',
      }),
    logout: () => $api<null>('/auth/logout', { method: 'POST' }),
  }
}
