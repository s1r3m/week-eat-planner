export const isUnauthorized = (error: unknown): boolean => {
  const source = error as null | {
    response?: { status?: number }
    status?: number
    statusCode?: number
  }
  return (
    (source?.statusCode ?? source?.status ?? source?.response?.status) === 401
  )
}

export const isPublicRoute = (path: string): boolean =>
  ['/', '/login', '/signup'].includes(path) || /^\/weeks\/[^/]+\/?$/.test(path)

export const getRedirectTarget = (value: unknown): string =>
  typeof value === 'string' &&
  value.startsWith('/') &&
  !value.startsWith('//') &&
  !value.includes('\\') &&
  [...value].every((character) => !(character.charCodeAt(0) <= 32))
    ? value
    : '/my/weeks'
