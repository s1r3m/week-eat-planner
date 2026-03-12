import { ref } from 'vue';
import type { UserWeek, UserWeekMinimal } from '@/domain/week/models';
import { defineStore } from 'pinia';
import { apiClient, getErrorMessage } from '@/api/client';

export const useWeekStore = defineStore('weeks-store', () => {
  const weeks = ref<UserWeekMinimal[]>([]);
  const error = ref<string | null>(null);
  const isLoading = ref<boolean>(false);
  const isFetchingWeeks = ref<boolean>(false);

  const fetchWeeks = async () => {
    isFetchingWeeks.value = true;
    error.value = null;
    try {
      const { data } = await apiClient.get<UserWeekMinimal[]>('/weeks');
      weeks.value = data;
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      console.log('Error fetching weeks:', errorMessage);
      error.value = errorMessage;
    } finally {
      isFetchingWeeks.value = false;
    }
  };

  const removeWeek = async (weekId: string) => {
    try {
      await apiClient.delete(`/weeks/${weekId}`);
      weeks.value = weeks.value.filter((week) => week.id !== weekId);
    } catch (err: unknown) {
      error.value = getErrorMessage(err);
      throw err;
    }
  };

  const addWeek = async (name: string) => {
    isLoading.value = true;
    try {
      const { data } = await apiClient.post<UserWeekMinimal>('/weeks', { name });
      weeks.value.push(data);
    } catch (err: unknown) {
      error.value = getErrorMessage(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateWeek = async (weekId: string, name: string) => {
    try {
      const { data } = await apiClient.patch<UserWeekMinimal>(`/weeks/${weekId}`, { name });
      weeks.value = weeks.value.map((week) => (week.id === weekId ? data : week));
      return data;
    } catch (err: unknown) {
      error.value = getErrorMessage(err);
      throw err;
    }
  };

  const getWeek = async (weekId: string) => {
    try {
      const { data } = await apiClient.get<UserWeek>(`/weeks/${weekId}`);
      return data;
    } catch (err: unknown) {
      error.value = getErrorMessage(err);
    }
  };

  const getWeekNameById = (weekId: string) => {
    const week = weeks.value.find((w) => w.id === weekId);
    return week?.name ?? '404';
  };

  return {
    weeks,
    error,
    isLoading,
    isFetchingWeeks,
    addWeek,
    getWeek,
    getWeekNameById,
    fetchWeeks,
    removeWeek,
    updateWeek,
  };
});
