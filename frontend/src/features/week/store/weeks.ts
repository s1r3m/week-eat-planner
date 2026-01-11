import { ref } from 'vue';
import type { ErrorResponse, UserWeek } from '@/api/types';
import { defineStore } from 'pinia';
import { apiClient, getErrorMessage } from '@/api/client';
import { useAlertStore } from '@/stores/error';
import axios from 'axios';

export const useWeekStore = defineStore('weeks-store', () => {
  const weeks = ref<UserWeek[]>([]);
  const error = ref<string | null>(null);
  const isLoading = ref<boolean>(false);
  const isFetchingWeeks = ref<boolean>(false);

  const fetchWeeks = async () => {
    isFetchingWeeks.value = true;
    error.value = null;
    try {
      const response = await apiClient.get<UserWeek[]>('/weeks');
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
      const response = await apiClient.delete(`/weeks/${weekId}`);
      if (response.status !== 204) {
        throw new Error(response.data || 'An unknown error occurred.');
      }
      weeks.value = weeks.value.filter((week) => week.id !== weekId);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      error.value = errorMessage;
    }
  };

  const addWeek = async (name: string) => {
    try {
      const response = await apiClient.post<UserWeek>('/weeks', { name });
      weeks.value.push(response.data as UserWeek);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      error.value = errorMessage;
    }
  };

  const updateWeek = async (weekId: string, name: string) => {
    try {
      const response = await apiClient.patch(`/weeks/${weekId}`, { name });
      const updatedWeek = response.data as UserWeek;
      weeks.value = weeks.value.map((week) => (week.id === weekId ? updatedWeek : week));
      return updatedWeek;
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      error.value = errorMessage;
    }
  };

  const getWeek = async (weekId: string) => {
    isLoading.value = true;
    try {
      const response = await apiClient.get(`/weeks/${weekId}`);
      if (response.status !== 200) {
        throw new Error(response.data || 'An unknown error occurred.');
      }
      return response.data as UserWeek;
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      error.value = errorMessage;
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
