# Web runtime config

The web build reads its config **at runtime**, so a single build works in every environment.

## Why

`expo export` inlines `process.env.EXPO_PUBLIC_*` into the bundle **at build time**, which means changing a value would require a rebuild. The web app avoids this by never reading `process.env` for these values.

`MOSTRO_SERVER_URL` and `GOOGLE_CLIENT_ID` are public by design. The client ID is the id_token's `aud`, and the URL shows up in every request. What this solves is deploy flexibility, not secrecy.

## How it works

| Piece | Role |
| --- | --- |
| `public/config.js` | Sets `window.__MOSTRO_CONFIG__`. Gitignored. Copy it from `public/config.js.example` |
| `src/app/+html.tsx` | Loads `<script src="/config.js">` synchronously, before the app bundle |
| `src/constants/runtime-config.ts` | Web: reads **only** `window.__MOSTRO_CONFIG__`. During static prerender it returns `''` |
| `src/constants/runtime-config.native.ts` | Android/iOS only (dev and release): reads `EXPO_PUBLIC_*` from `.env` (build time). Web never loads it, even under `pnpm web` |

Local web dev (`pnpm web`) also needs `public/config.js`: the dev server serves `public/` like the export. Without it the app throws `Missing runtime config` at boot.

## Changing config per environment

- **Cloudflare Pages** (`pnpm deploy:web`): edit the deployed `config.js`. No rebuild needed.
- **Docker** (`Dockerfile` + `docker/nginx.conf`): nginx serves `dist/` with an expo-router SPA fallback. `config.js` is whatever sat in `public/` at build time; the build fails if it is missing. To swap it without rebuilding, mount a file over it:

  ```sh
  docker run -v ./config.js:/usr/share/nginx/html/config.js:ro -p 8080:80 mostro-app-web
  ```

The only build arg is `EXPO_PUBLIC_DEV_LOGIN`; server URL and client ID always come from `config.js`.

Whenever you add a new origin, also add it to the Web OAuth client in Google Cloud.
