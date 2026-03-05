import { apiClient } from '@/api/client';
import type { UserWeek, UserWeekMinimal } from '@/domain/week/models';

export interface WeekPayload {
  name: string;
}

export const weekService = {
  async fetchWeeks(): Promise<UserWeekMinimal[]> {
    const { data } = await apiClient.get<UserWeekMinimal[]>('/weeks');
    return data;
  },

  async addWeek(payload: WeekPayload): Promise<UserWeekMinimal> {
    const { data } = await apiClient.post<UserWeekMinimal>('/weeks', payload);
    return data;
  },

  async removeWeek(weekId: string): Promise<void> {
    await apiClient.delete(`/weeks/${weekId}`);
  },

  async updateWeek(weekId: string, payload: WeekPayload): Promise<UserWeekMinimal> {
    const { data } = await apiClient.patch<UserWeekMinimal>(`/weeks/${weekId}`, payload);
    return data;
  },

  async getWeek(weekId: string): Promise<UserWeek> {
    const { data } = await apiClient.get<UserWeek>(`/weeks/${weekId}`);
    return data;
  },
};
