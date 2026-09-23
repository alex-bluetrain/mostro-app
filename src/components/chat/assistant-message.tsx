import * as Linking from 'expo-linking';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';

import { MessageBoundary } from '@/components/chat/message-boundary';
import OpenUIMessage from '@/components/openui/openui-message';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import type { ChatMessage } from '@/lib/use-mostro-chat';

type Props = {
  message: ChatMessage;
  onFollowUp: (text: string) => void;
};

type MessageActionEvent = {
  type: string;
  params?: Record<string, unknown>;
  humanFriendlyMessage?: string;
};

export function AssistantMessage({ message, onFollowUp }: Props) {
  const theme = useTheme();
  const scheme = useColorScheme();
  const { t } = useTranslation();

  const handleAction = async (event: MessageActionEvent) => {
    if (event.type === 'open_url') {
      const url = event.params?.url;
      if (typeof url === 'string') Linking.openURL(url).catch(() => {});
      return;
    }
    // Follow-ups, list items and buttons send their label back to the agent.
    if (event.humanFriendlyMessage) onFollowUp(event.humanFriendlyMessage);
  };

  return (
    <View style={styles.container}>
      {message.content ? (
        <MessageBoundary fallback={t('chat.renderFailed')}>
          <OpenUIMessage
            content={message.content}
            isStreaming={message.streaming}
            themeMode={scheme === 'dark' ? 'dark' : 'light'}
            onAction={handleAction}
            dom={
              Platform.OS === 'web'
                ? undefined
                : { matchContents: true, scrollEnabled: false }
            }
          />
        </MessageBoundary>
      ) : message.streaming && !message.error ? (
        <ActivityIndicator color={theme.textSecondary} />
      ) : null}

      {message.error ? (
        <ThemedText type="small" style={[styles.error, { color: theme.error }]}>
          {message.error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.two,
  },
  error: {
    marginTop: Spacing.one,
  },
});
