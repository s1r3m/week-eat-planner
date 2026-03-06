import { ref } from 'vue';
import type { UserWeek, UserWeekMinimal } from '@/domain/week/models';
import { defineStore } from 'pinia';
import { getErrorMessage } from '@/api/client';
import { weekService } from '../api/week.service';

export const useWeekStore = defineStore('weeks-store', () => {
  const weeks = ref<UserWeekMinimal[]>([]);
  const error = ref<string | null>(null);
  const isLoading = ref<boolean>(false);
  const isFetchingWeeks = ref<boolean>(false);

  const fetchWeeks = async () => {
    isFetchingWeeks.value = true;
    error.value = null;
    try {
      weeks.value = await weekService.fetchWeeks();
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
      await weekService.removeWeek(weekId);
      weeks.value = weeks.value.filter((week) => week.id !== weekId);
    } catch (err: unknown) {
      error.value = getErrorMessage(err);
      throw err;
    }
  };

  const addWeek = async (name: string) => {
    isLoading.value = true;
    try {
      const data = await weekService.addWeek({ name });
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
      const data = await weekService.updateWeek(weekId, { name });
      weeks.value = weeks.value.map((week) => (week.id === weekId ? data : week));
      return data;
    } catch (err: unknown) {
      error.value = getErrorMessage(err);
      throw err;
    }
  };

  const getWeek = async (weekId: string) => {
    isLoading.value = true;
    try {
      return await weekService.getWeek(weekId);
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
