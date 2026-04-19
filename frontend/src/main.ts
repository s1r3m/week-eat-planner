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

const handleGlobalError = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    toast.error(error instanceof Error ? error.message : 'An error occurred');
    return;
  }

  // Don't show toast for silent refresh failures
  if (error.config?.url?.includes('/auth/refresh')) return;

  const message =
    (error.response?.data as { detail?: string })?.detail || error.message || 'An error occurred';
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
