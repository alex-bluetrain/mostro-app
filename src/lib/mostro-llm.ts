import { fetch } from 'expo/fetch';

import { agUIAdapter, type ChatLLM, type Message } from '@openuidev/react-headless';

import { MOSTRO_SERVER_URL } from '@/constants/auth';
import { AuthError } from '@/lib/mostro-client';
import { getIdToken } from '@/lib/token-storage';

/**
 * ChatLLM for the mostro-supervisor OpenUI AG-UI route, consumed by
 * `<ChatProvider llm={mostroLLM}>`.
 *
 * Contract (mostro-server/src/mastra/routes/ag-ui.route.ts):
 * - POST ${MOSTRO_SERVER_URL}/agents/mostro-supervisor/openui
 * - Auth: Bearer <Google id_token>. Body accepts { messages, state? }; we send
 *   only { messages }. threadId/runId are derived server-side from the token.
 * - Response: text/event-stream of AG-UI events, parsed by `agUIAdapter`.
 *
 * A custom ChatLLM (instead of the library's `fetchLLM`) is required because:
 * - we need `expo/fetch` for `response.body` ReadableStream, and
 * - the id token is resolved async per request, so it cannot live in static
 *   `headers`.
 */
export const mostroLLM: ChatLLM = {
  streamProtocol: agUIAdapter(),
  async send({ messages, signal }: { messages: Message[]; signal: AbortSignal }) {
    const token = await getIdToken();
    if (!token) throw new AuthError(401);

    const response = await fetch(`${MOSTRO_SERVER_URL}/agents/mostro-supervisor/openui`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
      signal,
    });

    if (response.status === 401 || response.status === 403) {
      throw new AuthError(response.status);
    }
    if (!response.ok) {
      throw new Error(`mostro openui stream failed: ${response.status}`);
    }

    return response as unknown as Response;
  },
};
