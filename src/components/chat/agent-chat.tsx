'use dom';

import '@/lib/crypto-polyfill';
import '@openuidev/react-ui/index.css';
import '@/global.css';

import { agUIAdapter, type ChatLLM, type Message } from '@openuidev/react-headless';
import { AgentInterface, openuiChatLibrary } from '@openuidev/react-ui';
import { useState } from 'react';

import { webDarkTheme, webLightTheme } from '@/constants/web-theme';
import type { ChatRunPull, ChatRunStart } from '@/lib/chat-bridge';
import { OpenChatThread, singleThreadStorage } from '@/lib/single-thread-chat';

/**
 * Native chat: the same `AgentInterface` web uses (src/app/index.web.tsx),
 * run in a single webview so both platforms share streaming, history, the
 * tool-call timeline and the brand theme.
 *
 * Network calls stay native (src/lib/chat-bridge.ts): the webview only gets
 * async functions to start a run, pull its SSE chunks and load history.
 */
type Props = {
  threadId: string;
  themeMode: 'light' | 'dark';
  startRun: (messages: Message[]) => Promise<ChatRunStart>;
  pullRun: (runId: string) => Promise<ChatRunPull>;
  cancelRun: (runId: string) => Promise<void>;
  loadHistory: () => Promise<Message[]>;
  dom?: import('expo/dom').DOMProps;
};

type Bridge = Pick<Props, 'startRun' | 'pullRun' | 'cancelRun'>;

// A ChatLLM whose requests run natively: each SSE chunk is pulled across the
// bridge and fed to a Response, so agUIAdapter parses it as if fetched here.
function bridgeLLM({ startRun, pullRun, cancelRun }: Bridge): ChatLLM {
  return {
    streamProtocol: agUIAdapter(),
    async send({ messages, signal }) {
      const { runId, status } = await startRun(messages);
      if (status < 200 || status >= 300) {
        throw new Error(`mostro openui stream failed: ${status}`);
      }
      const cancel = () => void cancelRun(runId);
      signal.addEventListener('abort', cancel);
      const encoder = new TextEncoder();
      const body = new ReadableStream<Uint8Array>({
        async pull(controller) {
          const { chunk, done, error } = await pullRun(runId);
          if (chunk) controller.enqueue(encoder.encode(chunk));
          if (error) controller.error(new Error(error));
          else if (done) controller.close();
        },
        cancel,
      });
      return new Response(body, { headers: { 'Content-Type': 'text/event-stream' } });
    },
  };
}

export default function AgentChat({ threadId, themeMode, startRun, pullRun, cancelRun, loadHistory }: Props) {
  // Expo hands native functions over as proxies that call native by name, so
  // the first ones stay valid: build the llm and storage once, as
  // AgentInterface expects.
  const [llm] = useState(() => bridgeLLM({ startRun, pullRun, cancelRun }));
  const [storage] = useState(() => singleThreadStorage(threadId, loadHistory));

  return (
    <AgentInterface
      llm={llm}
      storage={storage}
      componentLibrary={openuiChatLibrary}
      agentName="mostro"
      theme={{ mode: themeMode, lightTheme: webLightTheme, darkTheme: webDarkTheme }}>
      <OpenChatThread threadId={threadId} />
    </AgentInterface>
  );
}
