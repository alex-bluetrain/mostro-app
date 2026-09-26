import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

// Resolves the app language before paint using the same priority chain as
// src/i18n: stored selection → browser locale → 'en'. Sets <html lang> and
// loads the Google Sign-In script with the matching locale (?hl=), since GIS
// resolves its widget locale at script load time.
// The 'mostro_language' key must match src/i18n/language-storage.web.ts.
const bootLocaleScript = `
(function () {
  var supported = ['en', 'es'];
  var lang = null;
  try { lang = localStorage.getItem('mostro_language'); } catch (e) {}
  if (supported.indexOf(lang) === -1) {
    lang = (navigator.language || 'en').split('-')[0];
  }
  if (supported.indexOf(lang) === -1) {
    lang = 'en';
  }
  document.documentElement.lang = lang;
  var s = document.createElement('script');
  s.src = 'https://accounts.google.com/gsi/client?hl=' + lang;
  s.async = true;
  document.head.appendChild(s);
})();
`;

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* Runtime config: sets window.__MOSTRO_CONFIG__ before the app bundle
            runs. Synchronous (no async/defer) so top-level reads in
            src/constants/auth.ts see it. Edit public/config.js on the host to
            change config without a rebuild. */}
        <script src="/config.js" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
        {/* Inter is web-only: iOS and Android already ship a guaranteed UI font
            (SF, Roboto), but on web the system stack varies by OS. It is
            consumed by the --font-display stack (global.css).
            display=swap avoids invisible text while it loads. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400..700&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: bootLocaleScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
