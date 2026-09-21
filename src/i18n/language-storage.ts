import * as SecureStore from 'expo-secure-store';

// Keep in sync with language-storage.web.ts and the inline <script> in
// src/app/+html.tsx (which reads the raw localStorage key before paint).
const LANGUAGE_STORAGE_KEY = 'mostro.language';

export async function getStoredLanguage(): Promise<string | null> {
  return SecureStore.getItemAsync(LANGUAGE_STORAGE_KEY);
}

export async function setStoredLanguage(language: string): Promise<void> {
  await SecureStore.setItemAsync(LANGUAGE_STORAGE_KEY, language);
}
