// Keep in sync with theme-storage.ts.
const THEME_STORAGE_KEY = 'mostro_theme';

// Guarded: this module also runs in Node during static rendering
// (expo export), where localStorage doesn't exist.
export async function getStoredTheme(): Promise<string | null> {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  return localStorage.getItem(THEME_STORAGE_KEY);
}

export async function setStoredTheme(theme: string): Promise<void> {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}
