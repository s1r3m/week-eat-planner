import { defineStore } from 'pinia';
import { computed } from 'vue';

export const useAlertStore = defineStore('error-store', () => {
  const errors: string[] = [];

  const addError = (errorMessage: string) => errors.push(errorMessage);
  const clearErrors = () => (errors.length = 0);
  const getAllErrors = (): string[] => {
    const saved_errors = [...errors];
    clearErrors();
    return saved_errors;
  };
  const isEmpty = computed(() => errors.length === 0);

  return {
    addError,
    clearErrors,
    getAllErrors,
    isEmpty,
  };
});
