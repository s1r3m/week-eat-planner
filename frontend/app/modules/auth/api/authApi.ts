import type {
  LoginPayload,
  SignupPayload,
  UserData,
} from '@/modules/auth/types'

import { AUTH_KEY } from '@/modules/auth/constants'

export const getUser = defineQuery(() => {
  const { $api } = useNuxtApp()

  return useQuery({
    key: AUTH_KEY.user(),
    staleTime: 1000 * 60 * 15,
    query: () => $api<UserData>('/user'),
  })
})

export const loginMutation = defineMutation(() => {
  const { $api } = useNuxtApp()
  const queryCache = useQueryCache()

  return useMutation({
    mutation: (body: LoginPayload) =>
      $api<UserData>('/auth/login', {
        body: new URLSearchParams({
          password: body.password,
          username: body.username,
        }),
        method: 'POST',
      }),
    onSuccess: (userInfo) => {
      queryCache.setQueryData(AUTH_KEY.user(), userInfo)
    },
  })
})

export const registerMutation = defineMutation(() => {
  const { $api } = useNuxtApp()
  const queryCache = useQueryCache()

  return useMutation({
    mutation: (body: SignupPayload) =>
      $api<UserData>('/auth/signup', { body, method: 'POST' }),
    onSuccess: (userInfo) => {
      queryCache.setQueryData(AUTH_KEY.user(), userInfo)
    },
  })
})

export const logoutMutation = defineMutation(() => {
  const { $api } = useNuxtApp()
  const queryCache = useQueryCache()

  return useMutation({
    mutation: () => $api<null>('/auth/logout', { method: 'POST' }),
    onSettled: () => {
      queryCache.invalidateQueries({ key: AUTH_KEY.user() })
    },
  })
})
