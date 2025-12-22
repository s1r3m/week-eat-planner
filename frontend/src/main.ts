import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedState from 'pinia-plugin-persistedstate';
import App from './App.vue';
import router from '@/router/index';

import '@/assets/style.css';
import { useAuthStore } from './features/auth/store/auth';

startApp();

async function startApp() {
  const app = createApp(App);
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedState);
  app.use(pinia);

  const authStore = useAuthStore();
  await authStore.refreshToken();

  app.use(router);
  app.mount('#app');
}
