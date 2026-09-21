// Runtime config for the WEB build.
//
// `expo export` inlines process.env.EXPO_PUBLIC_* at BUILD time. To deploy one
// build across environments, the web export loads a static /config.js at boot
// (see app/+html.tsx) that sets window.__MOSTRO_CONFIG__ synchronously, before
// the app bundle runs. Editing that file on the host (e.g. Cloudflare Pages)
// changes config with no rebuild.
//
// This module reads ONLY window.__MOSTRO_CONFIG__ — it never references
// process.env, so no EXPO_PUBLIC_* value gets baked into the web bundle. The
// native build uses runtime-config.native.ts, which reads env instead.

export type RuntimeConfig = {
  GOOGLE_CLIENT_ID?: string;
  MOSTRO_URL?: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __MOSTRO_CONFIG__: RuntimeConfig | undefined;
}

// True only in a real browser. Static prerender runs in Node, where there is no
// document and no /config.js — config resolves on the client, so we must not
// throw during the export.
const isBrowser = typeof document !== 'undefined';

export function getConfig(key: keyof RuntimeConfig): string {
  const runtime =
    (typeof globalThis !== 'undefined' && globalThis.__MOSTRO_CONFIG__) || {};
  const value = runtime[key];
  if (!value) {
    if (!isBrowser) {
      // Prerender: emit a placeholder. The browser reloads config.js and the
      // real value is read on the client before any request goes out.
      return '';
    }
    throw new Error(
      `Missing runtime config "${key}". Set it in the deployed public/config.js.`,
    );
  }
  return value;
}
