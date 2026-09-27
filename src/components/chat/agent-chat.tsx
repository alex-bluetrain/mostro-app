'use dom';

import '@/lib/crypto-polyfill';
import '@openuidev/react-ui/index.css';
import '@/global.css';

import {
  agUIAdapter,
  useThreadList,
  type ChatLLM,
  type ChatStorage,
  type Message,
} from '@openuidev/react-headless';
import { AgentInterface, openuiChatLibrary } from '@openuidev/react-ui';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { CHAT_THREAD_ID } from '@/constants/chat';
import { webDarkTheme, webLightTheme } from '@/constants/web-theme';
import type { ChatRunPull, ChatRunStart } from '@/lib/chat-bridge';

/**
 * Native chat: the same `AgentInterface` web uses (src/app/index.web.tsx),
 * run in a single webview so both platforms share streaming, history, the
 * tool-call timeline and the brand theme.
 *
 * Network calls stay native (src/lib/chat-bridge.ts): the webview only gets
 * async functions to start a run, pull its SSE chunks and load history.
 */
type Props = {
  themeMode: 'light' | 'dark';
  startRun: (messages: Message[]) => Promise<ChatRunStart>;
  pullRun: (runId: string) => Promise<ChatRunPull>;
  cancelRun: (runId: string) => Promise<void>;
  loadHistory: () => Promise<Message[]>;
  dom?: import('expo/dom').DOMProps;
};

export default function AgentChat(props: Props) {
  // Native function props are proxies; read the latest through a ref so the
  // llm and storage below stay stable for AgentInterface.
  const bridge = useRef(props);
  useLayoutEffect(() => {
    bridge.current = props;
  });

  const llm = useMemo<ChatLLM>(
    () => ({
      streamProtocol: agUIAdapter(),
      async send({ messages, signal }) {
        const { runId, status } = await bridge.current.startRun(messages);
        if (status < 200 || status >= 300) {
          throw new Error(`mostro openui stream failed: ${status}`);
        }
        const cancel = () => void bridge.current.cancelRun(runId);
        signal.addEventListener('abort', cancel);
        const encoder = new TextEncoder();
        const body = new ReadableStream<Uint8Array>({
          async pull(controller) {
            const { chunk, done, error } = await bridge.current.pullRun(runId);
            if (chunk) controller.enqueue(encoder.encode(chunk));
            if (error) controller.error(new Error(error));
            else if (done) controller.close();
          },
          cancel,
        });
        return new Response(body, { headers: { 'Content-Type': 'text/event-stream' } });
      },
    }),
    [],
  );

  const storage = useMemo<ChatStorage>(
    () => ({
      thread: {
        async listThreads() {
          return { threads: [] };
        },
        async createThread() {
          return { id: CHAT_THREAD_ID, title: 'mostro', createdAt: Date.now() };
        },
        async getMessages() {
          return bridge.current.loadHistory();
        },
        async updateThread(thread) {
          return thread;
        },
        async deleteThread() {},
      },
    }),
    [],
  );

  return (
    <AgentInterface
      llm={llm}
      storage={storage}
      componentLibrary={openuiChatLibrary}
      agentName="mostro"
      theme={{
        mode: props.themeMode,
        lightTheme: webLightTheme,
        darkTheme: webDarkTheme,
      }}>
      <LoadHistory />
    </AgentInterface>
  );
}

// One server thread per user: open it on mount so past messages load.
function LoadHistory() {
  const selectThread = useThreadList((s) => s.selectThread);
  useEffect(() => {
    selectThread(CHAT_THREAD_ID);
  }, [selectThread]);
  return null;
}
