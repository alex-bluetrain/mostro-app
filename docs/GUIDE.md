# mostro-app — Developer guide

## Layout

| Path | What lives there |
| --- | --- |
| `src/app/index.web.tsx` | Web chat: OpenUI's `AgentInterface` (sidebar, threads, streaming, settings modal) |
| `src/app/index.tsx` | Native (Android/iOS) chat: `ChatProvider` + `useThread`, one Expo DOM webview per assistant message |
| `src/lib/mostro-llm.ts` | The `ChatLLM` adapter both platforms use to stream from mostro-server (AG-UI over SSE) |
| `src/lib/auth-context*.tsx` | Google Sign-In (native SDK on Android, Google Identity Services on web) |
| `src/lib/token-storage*.ts` | `id_token` storage: SecureStore on Android, memory on web |
| `src/constants/theme.ts` / `web-theme.ts` | Native colors / web brand theme — see [THEMING.md](THEMING.md) |

Files with a `.web.tsx` / `.web.ts` suffix replace their native counterpart on web (Metro platform extensions).

## Configuration

Config comes from a different source on each platform. `src/constants/runtime-config.ts` (web) and `runtime-config.native.ts` (Android/iOS) are picked by Metro platform extensions.

| Key | Web (`public/config.js`, runtime) | Native (`.env`, build time) | Purpose |
| --- | --- | --- | --- |
| Server URL | `MOSTRO_SERVER_URL` | `EXPO_PUBLIC_MOSTRO_SERVER_URL` | mostro-server base URL (`http://10.0.2.2:4111` from the Android emulator) |
| Google client ID | `GOOGLE_CLIENT_ID` | `EXPO_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID; its `aud` must match the server's `GOOGLE_CLIENT_ID` |
| Dev login | — | `EXPO_PUBLIC_DEV_LOGIN` (read on **both** platforms at build time) | `1` enables the "Use API key" login (paste the server's `STUDIO_API_KEY`). Always on in `__DEV__` |

Web: `cp public/config.js.example public/config.js` (gitignored). See [docker-web-runtime-config.md](docker-web-runtime-config.md).

Routes on mostro-server have **no `/api` prefix**: `/users/me`, `/agents/mostro-supervisor/openui`.

## Deploy (web)

`pnpm deploy:web` exports the static build and uploads it to Cloudflare Pages. For the Docker image and runtime config, see [docker-web-runtime-config.md](docker-web-runtime-config.md).

## Known limitations

- **Web token storage is memory-only.** A page refresh logs the user out.
- **No token refresh.** Google id_tokens expire after ~1h and there is no silent re-auth; the user signs in again.
- **Android renders one webview per assistant message.** Web uses `AgentInterface` directly. Moving Android to `AgentInterface` needs a single `'use dom'` wrapper plus a native proxy for auth/streaming (SecureStore, `expo/fetch` and function props don't cross the DOM bridge).
