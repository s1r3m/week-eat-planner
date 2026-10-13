import { createI18n } from 'vue-i18n';
import en from './locales/en';
import ru from './locales/ru';

/**
 * Type definition for the application's translation schema.
 * Derived from the English locale file.
 */
export type MessageSchema = typeof en;

/**
 * Configured i18n instance for the application.
 * Supports English (en) and Russian (ru).
 */
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
