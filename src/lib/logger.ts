// Single seam for technical/diagnostic logging. Keeps raw endpoint/status detail
// out of the UI and in one place, so it can later be redirected to Sentry /
// EAS Insights without touching call sites. Deliberately minimal.
const PREFIX = '[mostro]';

export const logger = {
  error(...args: unknown[]): void {
    console.error(PREFIX, ...args);
  },
  warn(...args: unknown[]): void {
    console.warn(PREFIX, ...args);
  },
};
