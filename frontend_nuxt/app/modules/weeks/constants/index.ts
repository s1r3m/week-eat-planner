export const WEEKS_KEY = {
  root: () => ['weeks'],
  all: () => [...WEEKS_KEY.root(), 'all'],
  single: (id: string) => [...WEEKS_KEY.root(), 'week', id],
}
