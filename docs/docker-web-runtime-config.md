# Dockerize the web with runtime config (no rebuild per environment)

> Status: **plan / pending**. Nothing implemented yet.

## Goal

Serve the mostro-app web build from a Docker container and be able to change
`MOSTRO_SERVER_URL` and `GOOGLE_CLIENT_ID` **per environment (dev / staging / prod)
without rebuilding the image**. One image, different config via the container's
runtime env vars.

## Why `EXPO_PUBLIC_*` is not enough

`EXPO_PUBLIC_*` vars are injected at **build time** via textual replacement:
Metro looks for the literal `process.env.EXPO_PUBLIC_MOSTRO_SERVER_URL` in the code and
replaces it with the string during `npx expo export`. At runtime that
`process.env` no longer exists — the value is "baked" into the JS bundle.

Confirmed in the Expo v57 docs:
- `EXPO_PUBLIC_*` in client-side code is inlined when running `expo export`.
- The variables are inlined and **cannot be used dynamically**
  (`process.env["X"]` does not work, only literal dot access).

Conclusion: **Expo has no runtime env mechanism for static web.**
It has to be solved outside of Expo with the `config.js` pattern.

Note: `MOSTRO_SERVER_URL` and `GOOGLE_CLIENT_ID` are **public by design** (the client ID
goes in the id_token's `aud`, the URL is visible on every request). They are not
secrets. The point here is NOT security — it's deploy flexibility (same image,
different config per environment).

## Scope

- **Web only** (which is what gets dockerized). mostro-app is
  `web.output: "static"` and **has no API routes** (`+api.ts`), so the output is
  static HTML/JS/assets — served with nginx, no Node runtime or `@expo/server`.
- On **native (Android APK)** the vars are baked into the build no matter what.
  There is no runtime config possible there, but it isn't dockerized either, so
  it doesn't apply. Native keeps using build-time `EXPO_PUBLIC_*` as before.

## Pattern: `config.js` injected at runtime

1. **`public/config.js`** (placeholder for dev)
   Expo copies everything in `public/` to `dist/` during the export. Contents:
   ```js
   window.__MOSTRO_CONFIG__ = {
     MOSTRO_SERVER_URL: "https://<NGROK_DOMAIN>",
     GOOGLE_CLIENT_ID: "192249434965-...4vmnp6.apps.googleusercontent.com",
   };
   ```

2. **Inject `<script src="/config.js">` in the `<head>`**
   With `output: "static"` Expo generates the HTML; there is no custom
   `index.html`. Add the `<script>` in `src/app/+html.tsx` (it already exists —
   that's where the GIS script lives). It must load **before** the bundle.

3. **`src/constants/auth.ts` — read from runtime on web, build-time on native**
   ```ts
   import { Platform } from "react-native";

   const runtime =
     Platform.OS === "web" ? (globalThis as any).__MOSTRO_CONFIG__ : undefined;

   export const MOSTRO_SERVER_URL =
     runtime?.MOSTRO_SERVER_URL ?? process.env.EXPO_PUBLIC_MOSTRO_SERVER_URL!;
   export const GOOGLE_CLIENT_ID =
     runtime?.GOOGLE_CLIENT_ID ?? process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!;
   ```
   - Web: uses `window.__MOSTRO_CONFIG__` (runtime).
   - Native / dev without config.js: falls back to `EXPO_PUBLIC_*` (build-time).
     Compatible with the current flow.

4. **Dockerfile (multi-stage: build + nginx)**
   ```dockerfile
   FROM node:22-alpine AS build
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npx expo export -p web        # generates dist/

   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   COPY docker/entrypoint.sh /entrypoint.sh
   COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
   RUN chmod +x /entrypoint.sh
   EXPOSE 80
   ENTRYPOINT ["/entrypoint.sh"]
   ```

5. **`docker/entrypoint.sh` — generates config.js from the container env vars**
   ```sh
   #!/bin/sh
   set -e
   cat > /usr/share/nginx/html/config.js <<EOF
   window.__MOSTRO_CONFIG__ = {
     MOSTRO_SERVER_URL: "${MOSTRO_SERVER_URL}",
     GOOGLE_CLIENT_ID: "${GOOGLE_CLIENT_ID}",
   };
   EOF
   exec nginx -g "daemon off;"
   ```
   Overwrites the bundle's `config.js` with the environment values on each
   startup. Same image, different config per environment.

6. **`docker/nginx.conf` — SPA fallback for expo-router routes**
   ```nginx
   server {
     listen 80;
     root /usr/share/nginx/html;
     location / {
       try_files $uri $uri.html $uri/ /index.html;
     }
   }
   ```

7. **docker-compose (usage example)**
   ```yaml
   services:
     mostro-app-web:
       build: ./mostro-app
       ports:
         - "3001:80"
       environment:
         MOSTRO_SERVER_URL: https://<NGROK_DOMAIN>
         GOOGLE_CLIENT_ID: 192249434965-...4vmnp6.apps.googleusercontent.com
   ```

## Implementation checklist (for later)

- [ ] Create `public/config.js` (dev placeholder)
- [ ] Inject `<script src="/config.js">` in `src/app/+html.tsx`
- [ ] Update `src/constants/auth.ts` (runtime web + native fallback)
- [ ] Create `Dockerfile`, `docker/entrypoint.sh`, `docker/nginx.conf`
- [ ] Verify `npx expo export -p web` generates `dist/` OK
- [ ] Test the container with different env vars → confirm `config.js` changes
- [ ] Add each new origin/redirect to the Web client in Google Cloud
- [ ] Verify `.gitignore` does not include the `public/config.js` placeholder
      (or decide whether the dev placeholder should be committed)

## Verify before writing code

Read the versioned Expo v57 docs (https://docs.expo.dev/versions/v57.0.0/), as
AGENTS.md instructs, to confirm the behavior of `public/`, `+html.tsx` and
`expo export -p web` in this version.
