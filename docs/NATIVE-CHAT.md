# Native chat: why it runs in a webview

The app is native, except the chat body. On Android/iOS the chat is web's
`AgentInterface` (`@openuidev/react-ui`) inside a single Expo DOM component
(`src/components/chat/agent-chat.tsx`). The header, settings drawer and login
around it stay native.

## Decision

Expo's guidance is to keep DOM components focused and not put whole screens in
webviews. The chat is the deliberate exception, because OpenUI has no native
renderer:

- `@openuidev/react-lang` (0.3.0, latest) renders `<div>`s. Its `react-native`
  export re-exports the web bundle, so on native it needs a DOM shim (tried in
  `b85189b`, removed in `6ac511f`).
- Rendering natively means hand-writing a native twin of `openuiChatLibrary`,
  the library the server builds its system prompt from. That copy drifted from
  the server and was dropped (`6ac511f`).
- OpenUI's own Expo example takes the same hand-written-library route.

One webview keeps a single component library shared by server, web and native,
with streaming, history, the tool-call timeline and the brand theme for free.
Everything else in the app stays native.

Revisit if OpenUI ships a native renderer or a React Native component library.

## How it works

| Piece | Where | Role |
| --- | --- | --- |
| Chat screen | `src/app/index.tsx` | Native header + drawer, keyboard handling, hosts the DOM component |
| DOM chat | `src/components/chat/agent-chat.tsx` | `AgentInterface` with a `ChatLLM` and `ChatStorage` backed by native |
| Bridge | `src/lib/chat-bridge.ts` | Runs the requests natively and relays the stream |
| Shared | `src/lib/single-thread-chat.tsx` | Thread id, history storage and `<OpenChatThread />`, used by web and native |

**Requests stay native.** The webview's origin (Metro in dev, `file://` in
release) is not in the server's CORS list, and the id token stays in
SecureStore. DOM components can only call async native functions, so the SSE
body is relayed by pull: `startChatRun` opens the stream and buffers it, and the
webview calls `pullChatRun` until `done`, rebuilding a `Response` for
`agUIAdapter`.

**Keyboard.** Edge-to-edge Android ignores `adjustResize`, so the screen wraps
the webview in `react-native-keyboard-controller`'s `KeyboardAvoidingView`,
which follows the keyboard's real frame.

**Dev only:** Metro serves the webview over plain http, which is not a secure
context, so browsers omit `crypto.randomUUID`. `src/lib/crypto-polyfill.web.ts`
builds it from `getRandomValues`.
