import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { PiniaColada } from '@pinia/colada';
import piniaPluginPersistedState from 'pinia-plugin-persistedstate';
import App from '@/App.vue';
import router from '@/router';
import i18n from '@/i18n';

import '@/assets/style.css';

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedState);

app.use(pinia);
app.use(PiniaColada);
app.use(router);
app.use(i18n);
app.mount('#app');
