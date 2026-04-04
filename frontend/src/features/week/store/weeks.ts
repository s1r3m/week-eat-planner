import { ref } from 'vue';
import type { UserWeek, UserWeekMinimal } from '@/domain/week/models';
import { defineStore } from 'pinia';
import { apiClient, getErrorMessage } from '@/api/client';

/**
 * Store for managing weeks and meal slots.
 */
export const useWeekStore = defineStore('weeks-store', () => {
  /** List of weeks for the current user. */
  const weeks = ref<UserWeekMinimal[]>([]);
  /** Last error message if any. */
  const error = ref<string | null>(null);
  /** Loading state for general operations. */
  const isLoading = ref<boolean>(false);
  /** Loading state for fetching weeks. */
  const isFetchingWeeks = ref<boolean>(false);
  /** Whether the weeks have been initialized. */
  const isWeeksInitialized = ref<boolean>(false);

  /**
   * Fetches all weeks from the API.
   * @returns A promise that resolves when the weeks are fetched.
   */
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
      isWeeksInitialized.value = true;
    }
  };

  /**
   * Removes a week by ID.
   * @param weekId - The ID of the week to remove.
   * @returns A promise that resolves when the week is removed.
   * @throws Will throw an error if the deletion fails.
   */
  const removeWeek = async (weekId: string) => {
    try {
      await apiClient.delete(`/weeks/${weekId}`);
      weeks.value = weeks.value.filter((week) => week.id !== weekId);
    } catch (err: unknown) {
      error.value = getErrorMessage(err);
      throw err;
    }
  };

  /**
   * Adds a new week.
   * @param name - The name of the new week.
   * @returns A promise that resolves when the week is added.
   * @throws Will throw an error if the creation fails.
   */
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

  /**
   * Updates an existing week's name.
   * @param weekId - The ID of the week to update.
   * @param name - The new name for the week.
   * @returns A promise that resolves to the updated week minimal info.
   * @throws Will throw an error if the update fails.
   */
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

  /**
   * Fetches a full week by ID.
   * @param weekId - The ID of the week to fetch.
   * @returns A promise that resolves to the full week data.
   */
  const getWeek = async (weekId: string) => {
    try {
      const { data } = await apiClient.get<UserWeek>(`/weeks/${weekId}`);
      return data;
    } catch (err: unknown) {
      error.value = getErrorMessage(err);
    }
  };

  /**
   * Returns a week's name given its ID.
   * @param weekId - The ID of the week.
   * @returns The name of the week, or '404' if not found.
   */
  const getWeekNameById = (weekId: string) => {
    const week = weeks.value.find((w) => w.id === weekId);
    return week?.name ?? '404';
  };

  return {
    weeks,
    error,
    isLoading,
    isFetchingWeeks,
    isWeeksInitialized,
    addWeek,
    getWeek,
    getWeekNameById,
    fetchWeeks,
    removeWeek,
    updateWeek,
  };
});
