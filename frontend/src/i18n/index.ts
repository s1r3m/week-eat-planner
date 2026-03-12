import { createI18n } from 'vue-i18n';
import en from './locales/en';
import ru from './locales/ru';

export type MessageSchema = typeof en;

const i18n = createI18n<[MessageSchema], 'en' | 'ru'>({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    ru,
  },
});

export default i18n;
