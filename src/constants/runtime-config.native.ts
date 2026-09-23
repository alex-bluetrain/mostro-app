// Runtime config for NATIVE builds (iOS/Android) and the Metro dev server.
//
// Native apps have no /config.js, so config comes from process.env.EXPO_PUBLIC_*
// inlined at build time — the standard Expo mechanism. The web build uses
// runtime-config.ts instead, which reads window.__MOSTRO_CONFIG__ at runtime.

export type RuntimeConfig = {
  GOOGLE_CLIENT_ID?: string;
  MOSTRO_SERVER_URL?: string;
};

const env: Record<keyof RuntimeConfig, string | undefined> = {
  GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  MOSTRO_SERVER_URL: process.env.EXPO_PUBLIC_MOSTRO_SERVER_URL,
};

export function getConfig(key: keyof RuntimeConfig): string {
  const value = env[key];
  if (!value) {
    throw new Error(`Missing config "${key}". Set EXPO_PUBLIC_${key} in .env.`);
  }
  return value;
}
