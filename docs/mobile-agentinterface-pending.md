# Pending: unify mobile chat on AgentInterface

## Status

- **Web** (`src/app/index.web.tsx`): uses the all-in-one `AgentInterface`
  component from `@openuidev/react-ui`, rendered natively in the DOM. Gets
  incremental streaming, thread sidebar, reasoning loader, and tool-call
  timeline for free.
- **Mobile** (`src/app/index.tsx`): still on the custom architecture —
  `ChatProvider` + `useThread` + one Expo DOM webview per assistant message
  (`openui-message.tsx` with `'use dom'`). Tool activity and the reasoning
  spinner are hand-built.

## Goal

Run the same `AgentInterface` component on mobile so web and mobile share a
single chat implementation (one source of truth, no per-message webviews).

## Blocker

`AgentInterface` is DOM-only (depends on `@radix-ui/*`, `react-dom`,
`recharts`). To use it on native it must be wrapped in a single `'use dom'`
component. Inside that webview:

- `expo-secure-store` is unavailable (native keychain), so `getIdToken()`
  cannot run there.
- `expo/fetch` is unavailable (webview uses the browser `fetch`), so the
  streaming `ReadableStream` path in `mostro-llm` cannot run there.
- Function references (`llm.send`, `getIdToken`) are not serializable across
  the DOM bridge, so `mostroLLM` cannot be passed into the webview.

## Proposed approach

Introduce a native-side local proxy so the webview never needs auth or
native fetch:

1. A native HTTP endpoint receives `{ messages }`.
2. It calls `mostroLLM.send()` natively (has SecureStore + expo/fetch) and
   streams the SSE response back.
3. The webview's `AgentInterface` talks to the local proxy instead of the
   remote server; auth stays entirely on the native side.

Estimated effort: ~1 hour (proxy endpoint + `'use dom'` wrapping + Android
end-to-end test).

## Until then

Mobile keeps the custom per-message architecture. It works; this is a
convergence/maintenance improvement, not a bug fix.
