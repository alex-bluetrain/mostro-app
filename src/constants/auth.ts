import { getConfig } from '@/constants/runtime-config';

export const GOOGLE_CLIENT_ID = getConfig('GOOGLE_CLIENT_ID');

export const MOSTRO_SERVER_URL = getConfig('MOSTRO_SERVER_URL');

export const ID_TOKEN_STORAGE_KEY = 'mostro.id_token';

// Shows the mock API-key login (SimpleAuth) on the auth screen.
// __DEV__ is only true under the Metro dev server; the static `expo export`
// bundle runs in prod mode, so we gate on an explicit env var to also enable
// it in the dev Docker build.
export const DEV_API_KEY_LOGIN =
  process.env.EXPO_PUBLIC_DEV_LOGIN === '1' || __DEV__;
