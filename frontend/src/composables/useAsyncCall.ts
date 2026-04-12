import { ref } from 'vue';

/**
 * Composable for managing the lifecycle of an asynchronous task.
 * Provides reactive states for loading and errors.
 *
 * @param task - The asynchronous function to execute.
 * @returns An object containing the `call` function, `isLoading` state, and `error` state.
 */
export const useAsyncCall = <T, Args extends any[]>(task: (...args: Args) => Promise<T>) => {
  const isLoading = ref<boolean>(false);
  const error = ref<any>(null);

  const call = async (...args: Args) => {
    isLoading.value = true;
    error.value = null;

    try {
      return await task(...args);
    } catch (err) {
      error.value = err;
    } finally {
      isLoading.value = false;
    }
  };

  return { call, isLoading, error };
};
