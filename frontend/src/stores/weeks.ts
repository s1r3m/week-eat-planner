import { ref } from 'vue';
import type { Ref } from 'vue';
import type { ErrorResponse, UserWeek } from '@/types/api';
import { defineStore } from 'pinia';
import apiClient from '@/api/client';
import { useAlertStore } from '@/stores/error';

export const useWeekStore = defineStore('weeks-store', () => {
  const weeks = ref<UserWeek[]>([]);
  const error = ref<string | null>(null);
  const isLoading = ref<boolean>(false);

  const fetchWeeks = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await apiClient.get<UserWeek[] | ErrorResponse>('/weeks');
      if (response.status !== 200) {
        const error_body = response.data as ErrorResponse;
        error.value = `Could load weeks now. Try again later\n${error_body}`;
        return;
      }
      weeks.value = response.data as UserWeek[];
    } catch (error: any) {
      error.value = `Failed to fetch weeks: ${error.response?.status} -- ${error.response.data.detail}`;
      console.log(error.value);
    } finally {
      isLoading.value = false;
    }
  };

  const removeWeek = async (weekId: string) => {
    isLoading.value = true;
    try {
      const response = await apiClient.delete(`/weeks/${weekId}`);
      if (response.status !== 204) {
        useAlertStore().addError(response.data || 'An unknown error occurred.');
      }
      weeks.value = weeks.value.filter((week) => week.id !== weekId);
    } catch (err: any) {
      useAlertStore().addError(err.message);
    } finally {
      isLoading.value = false;
    }
  };

  const addWeek = async (name: string) => {
    isLoading.value = true;
    try {
      const response = await apiClient.post<UserWeek | ErrorResponse>('/weeks', { name });
      if (response.status !== 201) {
        const error_body = response.data as ErrorResponse;
        throw new Error(error_body.detail || 'An unknown error occurred.');
      }
      weeks.value.push(response.data as UserWeek);
    } catch (err: any) {
      useAlertStore().addError(err.message);
    } finally {
      isLoading.value = false;
    }
  };

  const updateWeek = async (weekId: string, name: string) => {
    isLoading.value = true;
    try {
      const response = await apiClient.patch(`/weeks/${weekId}`, { name });
      if (response.status !== 200) {
        throw new Error(response.data || 'An unknown error occurred.');
      }
      const updatedWeek = response.data as UserWeek;
      weeks.value = weeks.value.map((week) => (week.id === weekId ? updatedWeek : week));
      return updatedWeek;
    } catch (err: any) {
      useAlertStore().addError(err.message);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const getWeek = async (weekId: string) => {
    try {
      const response = await apiClient.get(`/weeks/${weekId}`);
      if (response.status !== 200) {
        throw new Error(response.data || 'An unknown error occurred.');
      }
      return response.data as UserWeek;
    } catch (err: any) {
      useAlertStore().addError(err.message);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    weeks,
    error,
    isLoading,
    addWeek,
    getWeek,
    fetchWeeks,
    removeWeek,
    updateWeek,
  };
});
