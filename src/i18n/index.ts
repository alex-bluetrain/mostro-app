import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform } from 'react-native';

import { getStoredLanguage, setStoredLanguage } from './language-storage';
import en from './locales/en';
import es from './locales/es';

export const SUPPORTED_LANGUAGES = ['en', 'es'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

function isAppLanguage(value: string): value is AppLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

const deviceLng = getLocales()[0]?.languageCode ?? 'en';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, es: { translation: es } },
  lng: deviceLng,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

// Single writer: changes i18next, persists, and (web) syncs <html lang>.
export async function setAppLanguage(lng: AppLanguage): Promise<void> {
  await i18n.changeLanguage(lng);
  await setStoredLanguage(lng);
  if (Platform.OS === 'web') {
    document.documentElement.lang = lng;
  }
}

// Hydrate persisted selection at boot (overrides device locale if present).
getStoredLanguage().then((stored) => {
  if (stored && isAppLanguage(stored) && stored !== i18n.language) {
    i18n.changeLanguage(stored);
  }
});

export default i18n;
