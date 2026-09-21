import * as Linking from 'expo-linking';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Renderer, type ActionEvent } from '@openuidev/react-lang';

import { nativeChatLibrary } from '@/components/openui/native-library';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ChatMessage } from '@/lib/use-mostro-chat';

type Props = {
  message: ChatMessage;
  onFollowUp: (text: string) => void;
};

export function AssistantMessage({ message, onFollowUp }: Props) {
  const theme = useTheme();

  const handleAction = (event: ActionEvent) => {
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
        <Renderer
          response={message.content}
          library={nativeChatLibrary}
          isStreaming={message.streaming}
          onAction={handleAction}
        />
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
