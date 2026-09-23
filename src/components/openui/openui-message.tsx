'use dom';

import '@openuidev/react-ui/index.css';

import { Renderer, type ActionEvent } from '@openuidev/react-lang';
import { ThemeProvider, openuiChatLibrary } from '@openuidev/react-ui';

/**
 * Renders one assistant message with the full OpenUI web component library.
 *
 * `'use dom'` makes this run as-is in the browser on web and inside a webview
 * on Android/iOS, so both platforms share the exact same renderer and the
 * exact same library the server's system prompt was generated from — no more
 * hand-copied native component declarations.
 *
 * Streaming bridge: the native side re-sends `content` as chunks accumulate;
 * each prop update re-renders the (incremental) OpenUI Lang parse.
 */
type Props = {
  content: string;
  isStreaming: boolean;
  themeMode: 'light' | 'dark';
  /** Serializable action callback marshalled back to the native side. */
  onAction: (event: {
    type: string;
    params?: Record<string, unknown>;
    humanFriendlyMessage?: string;
  }) => Promise<void>;
  dom?: import('expo/dom').DOMProps;
};

export default function OpenUIMessage({ content, isStreaming, themeMode, onAction }: Props) {
  const handleAction = (event: ActionEvent) => {
    void onAction({
      type: event.type,
      params: event.params as Record<string, unknown> | undefined,
      humanFriendlyMessage: event.humanFriendlyMessage,
    });
  };

  return (
    <ThemeProvider mode={themeMode}>
      <Renderer
        response={content}
        library={openuiChatLibrary}
        isStreaming={isStreaming}
        onAction={handleAction}
      />
    </ThemeProvider>
  );
}
