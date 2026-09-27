import type { Message } from '@openuidev/react-headless';

import { CHAT_THREAD_ID } from '@/constants/chat';
import { logger } from '@/lib/logger';
import { AuthError } from '@/lib/mostro-client';
import { mostroHistoryStorage } from '@/lib/mostro-history';
import { mostroLLM } from '@/lib/mostro-llm';

/**
 * Native side of the DOM chat (src/components/chat/agent-chat.tsx).
 *
 * The chat UI runs in a webview, but its requests run here: the webview's
 * origin (Metro in dev, file:// in release) is not allowed by the server's
 * CORS, and the id token stays in SecureStore instead of entering the webview.
 *
 * DOM components can only call async native functions, so the SSE body is
 * relayed by pull: `startChatRun` opens the stream and buffers it, and the
 * webview calls `pullChatRun` until `done`, rebuilding a Response from the
 * chunks for OpenUI's agUIAdapter.
 */

export type ChatRunStart = { runId: string; status: number };
export type ChatRunPull = { chunk: string; done: boolean; error?: string };

type Run = {
  chunks: string[];
  done: boolean;
  error?: string;
  wake?: () => void;
  controller: AbortController;
};

const runs = new Map<string, Run>();
let nextRunId = 0;

function wake(run: Run) {
  run.wake?.();
  run.wake = undefined;
}

async function pump(run: Run, body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      run.chunks.push(decoder.decode(value, { stream: true }));
      wake(run);
    }
  } catch (cause) {
    if (!run.controller.signal.aborted) {
      logger.error('chat stream failed', cause);
      run.error = 'stream failed';
    }
  }
  run.done = true;
  wake(run);
}

export async function startChatRun(messages: Message[]): Promise<ChatRunStart> {
  const runId = String(++nextRunId);
  const run: Run = { chunks: [], done: false, controller: new AbortController() };
  try {
    const response = await mostroLLM.send({
      threadId: CHAT_THREAD_ID,
      messages,
      signal: run.controller.signal,
    });
    if (!response.body) return { runId, status: 502 };
    runs.set(runId, run);
    void pump(run, response.body);
    return { runId, status: response.status };
  } catch (cause) {
    if (cause instanceof AuthError) return { runId, status: 401 };
    logger.error('chat request failed', cause);
    return { runId, status: 502 };
  }
}

// Resolves with everything buffered since the last pull, waiting for the next
// chunk when the buffer is empty.
export async function pullChatRun(runId: string): Promise<ChatRunPull> {
  const run = runs.get(runId);
  if (!run) return { chunk: '', done: true };
  if (!run.chunks.length && !run.done) {
    await new Promise<void>((resolve) => {
      run.wake = resolve;
    });
  }
  const chunk = run.chunks.join('');
  run.chunks = [];
  if (run.done) runs.delete(runId);
  return { chunk, done: run.done, error: run.error };
}

export async function cancelChatRun(runId: string): Promise<void> {
  const run = runs.get(runId);
  if (!run) return;
  runs.delete(runId);
  run.controller.abort();
  wake(run);
}

export async function loadChatHistory(email: string): Promise<Message[]> {
  return mostroHistoryStorage(email).thread.getMessages(CHAT_THREAD_ID);
}
