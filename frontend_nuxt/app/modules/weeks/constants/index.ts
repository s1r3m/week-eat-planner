export const WEEKS_KEY = {
  all: () => [...WEEKS_KEY.root(), 'all'],
  root: () => ['weeks'],
  single: (id: string) => [...WEEKS_KEY.root(), id],
}
