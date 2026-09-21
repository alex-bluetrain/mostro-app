// Keep in sync with language-storage.ts and the inline <script> in
// src/app/+html.tsx (which reads this exact localStorage key before paint).
const LANGUAGE_STORAGE_KEY = 'mostro_language';

// Guarded: this module also runs in Node during static rendering
// (expo export), where localStorage doesn't exist.
export async function getStoredLanguage(): Promise<string | null> {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  return localStorage.getItem(LANGUAGE_STORAGE_KEY);
}

export async function setStoredLanguage(language: string): Promise<void> {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
}
