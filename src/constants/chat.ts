// Each user has exactly one server thread (`<email>:web`); the server ignores
// the client thread id, so a constant is enough. Kept free of imports so the
// DOM chat (src/components/chat/agent-chat.tsx) can use it too.
export const CHAT_THREAD_ID = 'web';
