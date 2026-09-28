import type { Message } from '@openuidev/react-headless';

import { MOSTRO_SERVER_URL } from '@/constants/auth';
import { authHeaders, CHAT_CHANNEL } from '@/lib/mostro-client';
import { getIdToken } from '@/lib/token-storage';

// Show only what the model reads: Mastra's default `lastMessages` is 10.
// The route returns the newest page in chronological order.
const HISTORY_LIMIT = 10;

type StoredPart = { type: string; text?: string };
type StoredMessage = {
  id: string;
  role: string;
  content: { parts?: StoredPart[] };
};

// Only user/assistant text is shown; reasoning and tool calls stay server-side.
// Original ids are kept so the server skips messages it already has in memory.
function toChatMessage(m: StoredMessage): Message | null {
  const text = (m.content.parts ?? [])
    .filter((p) => p.type === 'text' && p.text)
    .map((p) => p.text)
    .join('\n');
  if (!text) return null;
  if (m.role === 'user') return { id: m.id, role: 'user', content: text };
  if (m.role === 'assistant') return { id: m.id, role: 'assistant', content: text };
  return null;
}

// The user's thread history, as the model sees it.
export async function fetchChatHistory(email: string): Promise<Message[]> {
  // Built-in Mastra memory route: unlike our custom routes it lives under /api.
  const threadId = encodeURIComponent(`${email}:${CHAT_CHANNEL}`);
  const res = await fetch(
    `${MOSTRO_SERVER_URL}/api/memory/threads/${threadId}/messages?agentId=mostro-supervisor&perPage=${HISTORY_LIMIT}`,
    { headers: authHeaders(await getIdToken()), credentials: 'include' },
  );
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`mostro history failed: ${res.status}`);
  const { messages } = (await res.json()) as { messages: StoredMessage[] };
  return messages.map(toChatMessage).filter((m): m is Message => m !== null);
}
