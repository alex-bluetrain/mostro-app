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
        {/* Inter es web-only: iOS y Android ya traen una fuente de UI garantizada
            (SF, Roboto), pero en web el stack del sistema cae en algo distinto
            segun el SO. El stack que la consume es --font-display (global.css).
            display=swap evita texto invisible mientras baja. */}
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
