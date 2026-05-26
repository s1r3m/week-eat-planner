import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { PiniaColada, PiniaColadaQueryHooksPlugin } from '@pinia/colada';
import piniaPluginPersistedState from 'pinia-plugin-persistedstate';
import { toast } from '@/components/ui/sonner';
import axios from 'axios';
import App from '@/App.vue';
import router from '@/router';
import i18n from '@/i18n';

import 'vue-sonner/style.css';
import '@/assets/style.css';

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedState);

/**
 * Global error handler for Axios and application-level errors.
 * Displays appropriate toast notifications based on the error type and context,
 * while ignoring silent failures like background token refreshes.
 *
 * @param error - The error object to handle.
 */
export const handleGlobalError = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    toast.error(error instanceof Error ? error.message : 'An error occurred');
    return;
  }

  // Don't show toast for silent refresh failures
  if (error.config?.url?.includes('/auth/refresh')) return;

  const detail = (error?.response?.data as { detail?: unknown } | undefined)?.detail;
  const message =
    typeof detail === 'string' && detail.trim() ? detail : error.message || 'An error occurred';
  toast.error(message);
};

app.use(pinia);
app.use(PiniaColada, {
  plugins: [PiniaColadaQueryHooksPlugin({ onError: handleGlobalError })],
  mutationOptions: { onError: handleGlobalError },
});
app.use(router);
app.use(i18n);
app.mount('#app');
