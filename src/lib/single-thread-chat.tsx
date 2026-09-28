import { useThreadList, type ChatStorage, type Message } from '@openuidev/react-headless';
import { useEffect } from 'react';

// Shared by the web chat and the native DOM chat, so it must stay free of
// platform imports (config, token storage): the webview can't load them.

// Each client has one server thread (`<email>:<CHAT_CHANNEL>`); callers pass
// CHAT_CHANNEL as the thread id so both sides use the same name.

// AgentInterface storage for that one thread: no thread list, only its history.
export function singleThreadStorage(
  threadId: string,
  getMessages: () => Promise<Message[]>,
): ChatStorage {
  return {
    thread: {
      async listThreads() {
        return { threads: [] };
      },
      async createThread() {
        return { id: threadId, title: 'mostro', createdAt: Date.now() };
      },
      getMessages: () => getMessages(),
      async updateThread(thread) {
        return thread;
      },
      async deleteThread() {},
    },
  };
}

// Render inside AgentInterface: opens the thread on mount so its history loads.
export function OpenChatThread({ threadId }: { threadId: string }) {
  const selectThread = useThreadList((s) => s.selectThread);
  useEffect(() => {
    selectThread(threadId);
  }, [selectThread, threadId]);
  return null;
}
