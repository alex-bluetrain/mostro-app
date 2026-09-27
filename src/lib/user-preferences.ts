import { MOSTRO_SERVER_URL } from '@/constants/auth';
import { SUPPORTED_LANGUAGES, setAppLanguage, type AppLanguage } from '@/i18n';
import { logger } from '@/lib/logger';
import { authHeaders, type MostroUser } from '@/lib/mostro-client';
import { THEME_PREFERENCES, setThemePreference, type ThemePreference } from '@/lib/theme-preference';
import { getIdToken } from '@/lib/token-storage';

// The user's preferences live on their Mongo user (`preferences`), so they follow
// them across devices. The local copy is only a cache: it paints the login screen
// and avoids a flash before /users/me answers.
export type UserPreferences = {
  notifications?: boolean;
  language?: AppLanguage;
  theme?: ThemePreference;
};

// Unset server values (null) keep whatever the device/local cache has.
export function applyUserPreferences(user: MostroUser): void {
  const prefs = user.preferences as { language?: string | null; theme?: string | null } | undefined;
  const language = prefs?.language;
  const theme = prefs?.theme;
  if (language && (SUPPORTED_LANGUAGES as readonly string[]).includes(language)) {
    void setAppLanguage(language as AppLanguage);
  }
  if (theme && (THEME_PREFERENCES as readonly string[]).includes(theme)) {
    void setThemePreference(theme as ThemePreference);
  }
}

export async function saveUserPreferences(changes: UserPreferences): Promise<void> {
  const endpoint = `${MOSTRO_SERVER_URL}/users/me/preferences`;
  try {
    const res = await fetch(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders(await getIdToken()) },
      credentials: 'include',
      body: JSON.stringify(changes),
    });
    if (!res.ok) logger.error(`saveUserPreferences failed: ${endpoint} -> ${res.status}`);
  } catch (cause) {
    // The choice is already applied and cached locally; it syncs next time.
    logger.error(`saveUserPreferences network error: ${endpoint}`, cause);
  }
}
