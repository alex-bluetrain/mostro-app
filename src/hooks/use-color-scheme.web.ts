import { useSyncExternalStore } from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';

import { getThemePreference, subscribeThemePreference } from '@/lib/theme-preference';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */

function subscribe(onChange: () => void) {
  const subscription = Appearance.addChangeListener(onChange);
  const unsubscribePreference = subscribeThemePreference(onChange);
  return () => {
    subscription.remove();
    unsubscribePreference();
  };
}

// A light/dark choice in Settings wins; 'system' follows the browser.
// Appearance.getColorScheme() is typed as nullable for native; on web it always
// resolves to 'light' or 'dark'. The fallback keeps the return type identical to
// the native variant, which re-exports RN's useColorScheme(): ColorSchemeName.
function getSnapshot(): ColorSchemeName {
  const preference = getThemePreference();
  if (preference !== 'system') return preference;
  return Appearance.getColorScheme() ?? 'unspecified';
}

// React uses this for the prerender AND for the hydrating render, so the first
// client paint matches the static HTML. It re-reads getSnapshot right after,
// switching to the real scheme without a mismatch.
function getServerSnapshot(): ColorSchemeName {
  return 'light';
}

export function useColorScheme() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
