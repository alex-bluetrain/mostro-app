import { useSyncExternalStore } from 'react';
import { Appearance, Platform } from 'react-native';

import { getStoredTheme, setStoredTheme } from '@/lib/theme-storage';

export const THEME_PREFERENCES = ['system', 'light', 'dark'] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

let current: ThemePreference = 'system';
const listeners = new Set<() => void>();

function isThemePreference(value: string): value is ThemePreference {
  return (THEME_PREFERENCES as readonly string[]).includes(value);
}

function apply(preference: ThemePreference) {
  current = preference;
  // Native: overriding Appearance makes RN's useColorScheme (and system UI
  // such as alerts and the keyboard) follow the choice. Web has no override,
  // so use-color-scheme.web.ts reads the preference directly.
  if (Platform.OS !== 'web') {
    Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
  }
  listeners.forEach((listener) => listener());
}

export async function setThemePreference(preference: ThemePreference): Promise<void> {
  apply(preference);
  await setStoredTheme(preference);
}

export function subscribeThemePreference(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function getThemePreference(): ThemePreference {
  return current;
}

export function useThemePreference(): ThemePreference {
  return useSyncExternalStore(subscribeThemePreference, getThemePreference, () => 'system');
}

// Hydrate the persisted choice at boot.
getStoredTheme().then((stored) => {
  if (stored && isThemePreference(stored) && stored !== current) {
    apply(stored);
  }
});
