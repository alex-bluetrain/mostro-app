import { fetch } from 'expo/fetch';

import { agUIAdapter, type AGUIEvent, type Message } from '@openuidev/react-headless';
import { EventType } from '@openuidev/react-headless';

import { MOSTRO_SERVER_URL } from '@/constants/auth';
import { AuthError } from '@/lib/mostro-client';

/**
 * Streams a mostro-supervisor run over the OpenUI AG-UI route.
 *
 * Contract (mostro/src/mastra/routes/ag-ui.route.ts):
 * - POST ${MOSTRO_SERVER_URL}/agents/mostro-supervisor/openui
 * - Auth: Bearer <Google id_token>; body is only { messages, state? }.
 *   threadId/runId are derived server-side from the bearer token.
 * - Response: text/event-stream of `data: {AG-UI event JSON}\n\n`,
 *   terminated by `data: [DONE]\n\n`.
 * - Non-standard failure frame: `data: {"error":"..."}\n\n` (no `type` field),
 *   then the stream closes — guarded below.
 *
 * Uses expo/fetch because the global React Native fetch has no
 * `response.body` ReadableStream for the adapter to consume.
 */
export async function* streamAgentRun(
  idToken: string,
  messages: Message[],
  signal?: AbortSignal,
): AsyncGenerator<AGUIEvent> {
  const response = await fetch(`${MOSTRO_SERVER_URL}/agents/mostro-supervisor/openui`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
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

  for await (const event of agUIAdapter().parse(response as unknown as Response)) {
    // The server's non-standard error frame `{"error":"..."}` has no `type`.
    if (event == null || typeof event !== 'object' || !('type' in event)) {
      const message = (event as { error?: unknown } | null)?.error;
      throw new Error(typeof message === 'string' ? message : 'stream error');
    }

    if (event.type === EventType.RUN_ERROR) {
      throw new Error(event.message ?? 'run error');
    }

    yield event;
  }
}
