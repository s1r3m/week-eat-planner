export const getFormErrorMessage = (error: unknown): string => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'data' in error &&
    error.data
  ) {
    const body = error.data as { detail?: unknown }
    if (typeof body.detail === 'string' && body.detail) return body.detail
  }
  return 'Something went wrong'
}
