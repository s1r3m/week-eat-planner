import { apiClient } from './client';

interface WeekPreview {
  id: string;
  name: string;
  user_id: string;
}

export const WEEK_KEYS = {
  root: ['weeks'] as const,
  all: () => [...WEEK_KEYS.root, 'list'] as const,
  detail: (id: string) => [...WEEK_KEYS.root, 'detail', id] as const,
};

export const getWeeks = async () =>
  await apiClient.get<WeekPreview[]>('/weeks').then((res) => res.data);
