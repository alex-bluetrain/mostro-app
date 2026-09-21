export const GOOGLE_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!;

export const MOSTRO_URL = process.env.EXPO_PUBLIC_MOSTRO_URL!;

export const ID_TOKEN_STORAGE_KEY = 'mostro.id_token';

// Muestra el login mock con API key (SimpleAuth) en la pantalla de auth.
// __DEV__ solo es true bajo el dev server de Metro; el bundle estático de
// `expo export` corre en modo prod, así que gateamos con una env explícita
// para poder habilitarlo también en el build Docker de dev.
export const DEV_API_KEY_LOGIN =
  process.env.EXPO_PUBLIC_DEV_LOGIN === '1' || __DEV__;
