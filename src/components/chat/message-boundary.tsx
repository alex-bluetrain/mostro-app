import { Component, type ReactNode } from 'react';

import { ThemedText } from '@/components/themed-text';
import { logger } from '@/lib/logger';

type Props = {
  children: ReactNode;
  /** Shown in place of the message when its render throws. */
  fallback: string;
};

type State = { failed: boolean };

/**
 * Keeps one bad assistant message from unmounting the whole app.
 *
 * `@openuidev/react-lang` guards each registered component with its own
 * boundary, but anything it renders around them — its wrapper element, its
 * query loader — is outside that guard. A throw there propagates to the root
 * and blanks the screen, which is what happened on Android before the DOM
 * shim landed. This boundary is the backstop: the transcript keeps working and
 * the failure stays inside the one message that caused it.
 */
export class MessageBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    logger.error('assistant message failed to render', error);
  }

  componentDidUpdate(prev: Props) {
    // A new message in the same slot deserves a fresh attempt.
    if (this.state.failed && prev.children !== this.props.children) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (this.state.failed) {
      return <ThemedText type="small" themeColor="error">{this.props.fallback}</ThemedText>;
    }
    return this.props.children;
  }
}
