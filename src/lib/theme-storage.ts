import * as SecureStore from 'expo-secure-store';

// Keep in sync with theme-storage.web.ts.
const THEME_STORAGE_KEY = 'mostro.theme';

export async function getStoredTheme(): Promise<string | null> {
  return SecureStore.getItemAsync(THEME_STORAGE_KEY);
}

export async function setStoredTheme(theme: string): Promise<void> {
  await SecureStore.setItemAsync(THEME_STORAGE_KEY, theme);
}
