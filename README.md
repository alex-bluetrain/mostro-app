<p align="center">
  <img src="https://raw.githubusercontent.com/alex-bluetrain/mostro-server/main/docs/mostro-avatar.jpg" width="120" alt="Mostro logo" />
</p>

<h1 align="center">mostro-app</h1>

<p align="center">
  Android and web client for <a href="https://github.com/alex-bluetrain/mostro-server">Mostro</a>, a family care assistant.
</p>

<p align="center">
  <a href="https://github.com/alex-bluetrain/mostro-app/releases"><img src="https://img.shields.io/github/v/release/alex-bluetrain/mostro-app?style=flat-square" alt="Release" /></a>
  <img src="https://img.shields.io/badge/Expo-57-000020?style=flat-square&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/platforms-android%20%7C%20web-blue?style=flat-square" alt="Platforms" />
</p>

## Description

An [Expo](https://expo.dev) app for chatting with the Mostro assistant. Replies render as
generative UI with [OpenUI](https://github.com/thesysdev/openui).

- **Android, iOS and web** from one Expo project: auth, streaming and settings are shared; the chat screen is platform-specific (OpenUI `AgentInterface` on web, a native chat on mobile).
- **Google Sign-In**: the Google ID token authenticates each request to mostro-server.
- **Streaming chat**: replies stream in as they are generated, with visible tool calls.
- **English and Spanish** interface.

## Quick start

Requires Node.js 22, pnpm and a running [mostro-server](https://github.com/alex-bluetrain/mostro-server).

```bash
pnpm install
cp public/config.js.example public/config.js   # web: server URL + Google client ID
cp .env.example .env                           # native: same values as EXPO_PUBLIC_*
pnpm web               # web
pnpm android           # Android (emulator or device)
```

The web build (dev and export) reads `public/config.js` at runtime, not `.env`. See [Web runtime config](docs/docker-web-runtime-config.md).

## Scripts

| Command        | Description                          |
| -------------- | ------------------------------------ |
| `pnpm start`   | Start the Expo dev server            |
| `pnpm android` | Build and run on Android             |
| `pnpm ios`     | Build and run on iOS (macOS + Xcode) |
| `pnpm web`     | Run in the browser                   |
| `pnpm lint`    | Lint the project                     |
| `pnpm build:web` | Export the static web build        |
| `pnpm deploy:web` | Export and upload to Cloudflare Pages |

## Documentation

- [Theming](docs/THEMING.md)
- [Docker web runtime config](docs/docker-web-runtime-config.md)
- [Developer guide & known limitations](docs/GUIDE.md)

## License

MIT — see [LICENSE](LICENSE).
