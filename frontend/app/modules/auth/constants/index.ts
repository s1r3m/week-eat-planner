export const AUTH_KEY = {
  root: () => ['auth'] as const,
  user: () => [...AUTH_KEY.root(), 'user'] as const,
}
