# Dockerizar la web con config en runtime (no rebuildear por entorno)

> Estado: **plan / pendiente**. Nada implementado todavía.

## Objetivo

Servir la build web de mostro-expo desde un contenedor Docker y poder cambiar
`MOSTRO_URL` y `GOOGLE_CLIENT_ID` **por entorno (dev / staging / prod) sin
rebuildear la imagen**. Una sola imagen, distinta config vía env vars del
contenedor en runtime.

## Por qué no alcanza con `EXPO_PUBLIC_*`

Las vars `EXPO_PUBLIC_*` se inyectan en **build time** por reemplazo textual:
Metro busca el literal `process.env.EXPO_PUBLIC_MOSTRO_URL` en el código y lo
reemplaza por el string durante `npx expo export`. En runtime ese `process.env`
ya no existe — el valor queda "quemado" en el bundle JS.

Confirmado en la doc de Expo v57:
- Las `EXPO_PUBLIC_*` del código client-side se inlinean al correr `expo export`.
- Las variables se inlinean y **no se pueden usar dinámicamente**
  (`process.env["X"]` no funciona, solo el acceso literal con punto).

Conclusión: **Expo no tiene mecanismo de env en runtime para web estático.**
Hay que resolverlo por fuera de Expo con el patrón `config.js`.

Nota: `MOSTRO_URL` y `GOOGLE_CLIENT_ID` son **públicos por diseño** (el client ID
va en el `aud` del id_token, la URL se ve en cada request). No son secretos.
El valor de esto NO es seguridad — es flexibilidad de deploy (misma imagen,
distinta config por entorno).

## Alcance

- **Solo web** (que es lo que se dockeriza). mostro-expo es `web.output: "static"`
  y **no tiene API routes** (`+api.ts`), así que el output es HTML/JS/assets
  estáticos — se sirve con nginx, sin runtime Node ni `@expo/server`.
- En **native (Android APK)** las vars quedan quemadas en el build sí o sí. Ahí
  no hay runtime config posible, pero tampoco se dockeriza, así que no aplica.
  Native sigue usando `EXPO_PUBLIC_*` build-time como hasta ahora.

## Patrón: `config.js` inyectado en runtime

1. **`public/config.js`** (placeholder para dev)
   Expo copia todo lo de `public/` a `dist/` durante el export. Contenido:
   ```js
   window.__MOSTRO_CONFIG__ = {
     MOSTRO_URL: "https://<NGROK_DOMAIN>",
     GOOGLE_CLIENT_ID: "192249434965-...4vmnp6.apps.googleusercontent.com",
   };
   ```

2. **Inyectar `<script src="/config.js">` en el `<head>`**
   En `output: "static"` Expo genera el HTML; no hay `index.html` propio.
   Se agrega el `<script>` en `src/app/+html.tsx` (ya existe — ahí está el
   script de GIS). Tiene que cargar **antes** del bundle.

3. **`src/constants/auth.ts` — leer de runtime en web, build-time en native**
   ```ts
   import { Platform } from "react-native";

   const runtime =
     Platform.OS === "web" ? (globalThis as any).__MOSTRO_CONFIG__ : undefined;

   export const MOSTRO_URL =
     runtime?.MOSTRO_URL ?? process.env.EXPO_PUBLIC_MOSTRO_URL!;
   export const GOOGLE_CLIENT_ID =
     runtime?.GOOGLE_CLIENT_ID ?? process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!;
   ```
   - Web: usa `window.__MOSTRO_CONFIG__` (runtime).
   - Native / dev sin config.js: cae a `EXPO_PUBLIC_*` (build-time). Compatible
     con el flujo actual.

4. **Dockerfile (multi-stage: build + nginx)**
   ```dockerfile
   FROM node:22-alpine AS build
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npx expo export -p web        # genera dist/

   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   COPY docker/entrypoint.sh /entrypoint.sh
   COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
   RUN chmod +x /entrypoint.sh
   EXPOSE 80
   ENTRYPOINT ["/entrypoint.sh"]
   ```

5. **`docker/entrypoint.sh` — genera config.js desde las env vars del contenedor**
   ```sh
   #!/bin/sh
   set -e
   cat > /usr/share/nginx/html/config.js <<EOF
   window.__MOSTRO_CONFIG__ = {
     MOSTRO_URL: "${MOSTRO_URL}",
     GOOGLE_CLIENT_ID: "${GOOGLE_CLIENT_ID}",
   };
   EOF
   exec nginx -g "daemon off;"
   ```
   Sobreescribe el `config.js` del bundle con los valores del entorno en cada
   arranque. Misma imagen, distinta config por entorno.

6. **`docker/nginx.conf` — SPA fallback para rutas de expo-router**
   ```nginx
   server {
     listen 80;
     root /usr/share/nginx/html;
     location / {
       try_files $uri $uri.html $uri/ /index.html;
     }
   }
   ```

7. **docker-compose (ejemplo de uso)**
   ```yaml
   services:
     mostro-expo-web:
       build: ./mostro-expo
       ports:
         - "3001:80"
       environment:
         MOSTRO_URL: https://<NGROK_DOMAIN>
         GOOGLE_CLIENT_ID: 192249434965-...4vmnp6.apps.googleusercontent.com
   ```

## Checklist de implementación (para otro momento)

- [ ] Crear `public/config.js` (placeholder dev)
- [ ] Inyectar `<script src="/config.js">` en `src/app/+html.tsx`
- [ ] Actualizar `src/constants/auth.ts` (runtime web + fallback native)
- [ ] Crear `Dockerfile`, `docker/entrypoint.sh`, `docker/nginx.conf`
- [ ] Verificar `npx expo export -p web` genera `dist/` OK
- [ ] Probar container con distintas env vars → confirmar que `config.js` cambia
- [ ] Agregar cada origin/redirect nuevo al Web client en Google Cloud
- [ ] Verificar que `.gitignore` no incluya el `public/config.js` placeholder
      (o decidir si el placeholder de dev se commitea)

## Verificar antes de escribir código

Leer la doc versionada de Expo v57 (https://docs.expo.dev/versions/v57.0.0/),
según indica AGENTS.md, para confirmar comportamiento de `public/`, `+html.tsx`
y `expo export -p web` en esta versión.
