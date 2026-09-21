import * as Crypto from 'expo-crypto';
import { useCallback, useEffect, useRef, useState } from 'react';

import { EventType, type Message } from '@openuidev/react-headless';

import i18n from '@/i18n';
import { AuthError } from '@/lib/mostro-client';
import { streamAgentRun } from '@/lib/openui-stream';
import { getIdToken } from '@/lib/token-storage';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  /** For assistant messages this is the accumulated OpenUI Lang source. */
  content: string;
  streaming: boolean;
  error?: string;
};

export function useMostroChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // No history hydration endpoint exists yet, so the local list starts empty on
  // each app launch. Server memory (thread `email:web`) still gives the agent
  // continuity across launches; only the local transcript resets.

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const patchMessage = useCallback((id: string, patch: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isRunning) return;

      const userMessage: ChatMessage = {
        id: Crypto.randomUUID(),
        role: 'user',
        content: trimmed,
        streaming: false,
      };

      const history = [...messages, userMessage];
      setMessages(history);
      setIsRunning(true);

      const controller = new AbortController();
      abortRef.current = controller;

      let assistantId: string | null = null;
      // Maps the server's messageId to our local assistant message id so
      // TEXT_MESSAGE_CHUNK frames (which carry no START) accumulate correctly.
      let chunkMessageId: string | null = null;

      try {
        const token = await getIdToken();
        if (!token) {
          throw new AuthError(401);
        }

        const wireMessages: Message[] = history.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        }));

        for await (const event of streamAgentRun(token, wireMessages, controller.signal)) {
          switch (event.type) {
            case EventType.TEXT_MESSAGE_START: {
              assistantId = Crypto.randomUUID();
              const assistantMessage: ChatMessage = {
                id: assistantId,
                role: 'assistant',
                content: '',
                streaming: true,
              };
              setMessages((prev) => [...prev, assistantMessage]);
              break;
            }
            case EventType.TEXT_MESSAGE_CONTENT: {
              if (assistantId) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: m.content + event.delta } : m,
                  ),
                );
              }
              break;
            }
            case EventType.TEXT_MESSAGE_CHUNK: {
              // Self-contained frame: {messageId, delta} with no START/END.
              // The first chunk of a new server messageId opens the message.
              if (event.messageId && event.messageId !== chunkMessageId) {
                chunkMessageId = event.messageId;
                assistantId = Crypto.randomUUID();
                setMessages((prev) => [
                  ...prev,
                  { id: assistantId!, role: 'assistant', content: '', streaming: true },
                ]);
              }
              if (assistantId && typeof event.delta === 'string') {
                const delta = event.delta;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: m.content + delta } : m,
                  ),
                );
              }
              break;
            }
            case EventType.TEXT_MESSAGE_END: {
              if (assistantId) patchMessage(assistantId, { streaming: false });
              break;
            }
            case EventType.RUN_FINISHED: {
              setMessages((prev) => prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)));
              break;
            }
            default:
              // TOOL_CALL_*, RUN_STARTED, reasoning, etc. are ignored in v1.
              break;
          }
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        const isAuth = err instanceof AuthError;
        const errorText = isAuth
          ? i18n.t('chat.sessionExpired')
          : err instanceof Error
            ? err.message
            : i18n.t('chat.genericError');

        if (assistantId) {
          patchMessage(assistantId, { streaming: false, error: errorText });
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: Crypto.randomUUID(),
              role: 'assistant',
              content: '',
              streaming: false,
              error: errorText,
            },
          ]);
        }
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setIsRunning(false);
      }
    },
    [isRunning, messages, patchMessage],
  );

  return { messages, isRunning, sendMessage };
}
