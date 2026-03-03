import { ref } from 'vue';
import type { UserWeek, UserWeekMinimal } from '@/app/api/types';
import { defineStore } from 'pinia';
import { apiClient, getErrorMessage } from '@/app/api/client';

export const useWeekStore = defineStore('weeks-store', () => {
  const weeks = ref<UserWeekMinimal[]>([]);
  const error = ref<string | null>(null);
  const isLoading = ref<boolean>(false);
  const isFetchingWeeks = ref<boolean>(false);

  const fetchWeeks = async () => {
    isFetchingWeeks.value = true;
    error.value = null;
    try {
      const response = await apiClient.get<UserWeekMinimal[]>('/weeks');
      weeks.value = response.data;
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
    }
  };

  const addWeek = async (name: string) => {
    isLoading.value = true;
    try {
      const response = await apiClient.post<UserWeekMinimal>('/weeks', { name });
      weeks.value.push(response.data);
    } catch (err: unknown) {
      error.value = getErrorMessage(err);
    } finally {
      isLoading.value = false;
    }
  };

  const updateWeek = async (weekId: string, name: string) => {
    try {
      const response = await apiClient.patch<UserWeekMinimal>(`/weeks/${weekId}`, { name });
      const updatedWeek = response.data;
      weeks.value = weeks.value.map((week) => (week.id === weekId ? updatedWeek : week));
      return updatedWeek;
    } catch (err: unknown) {
      error.value = getErrorMessage(err);
    }
  };

  const getWeek = async (weekId: string) => {
    isLoading.value = true;
    try {
      const response = await apiClient.get<UserWeek>(`/weeks/${weekId}`);
      return response.data;
    } catch (err: unknown) {
      error.value = getErrorMessage(err);
    } finally {
      isLoading.value = false;
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
