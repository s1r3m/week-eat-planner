import { ref } from 'vue';
import type { Ref } from 'vue';
import type { UserWeek } from '@/types/api';
import { defineStore } from 'pinia';
import apiClient from '@/api/client';
import { useAlertStore } from '@/stores/error';

export const useWeekStore = defineStore('weeks-store', () => {
  const weeks: Ref<Array<UserWeek>> = ref([]);

  const fetchWeeks = async (): Promise<boolean> => {
    try {
      const response = await apiClient.get<UserWeek[]>('/weeks');
      weeks.value = response.data;
      return true;
    } catch (error: any) {
      const error_message =
        error.response?.data?.detail || error.message || 'An unknown error occurred';
      useAlertStore().addError(`Failed to fetch weeks: ${error_message}`);
      // Let the page handle redirect if unauthorized.
      if (error.response?.status === 401) {
        throw error;
      }
      return false;
    }
  };

  const removeWeek = async (weekId: string) => {
    try {
      const response = await apiClient.delete(`/weeks/${weekId}`);
      if (response.status !== 204) {
        useAlertStore().addError(response.data || 'An unknown error occurred.');
      }
      weeks.value = weeks.value.filter((week) => week.id !== weekId);
    } catch (err: any) {
      useAlertStore().addError(err.message);
    }
  };

  const addWeek = async (name: string) => {
    try {
      const response = await apiClient.post('/weeks', { name });
      if (response.status !== 201) {
        throw new Error(response.data || 'An unknown error occurred.');
      }
      weeks.value.push(response.data as UserWeek);
    } catch (err: any) {
      useAlertStore().addError(err.message);
    }
  };

  const getWeek = async (weekId: string): Promise<UserWeek | null> => {
    try {
      const response = await apiClient.get(`/weeks/${weekId}`);
      if (response.status !== 200) {
        throw new Error(response.data || 'An unknown error occurred.');
      }
      return response.data as UserWeek;
    } catch (err: any) {
      useAlertStore().addError(err.message);
      return null;
    }
  };

  return {
    weeks,
    addWeek,
    getWeek,
    fetchWeeks,
    removeWeek,
  };
});
