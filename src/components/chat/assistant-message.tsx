import * as Linking from 'expo-linking';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';

import { useToolActivities, type AssistantMessage as AssistantMessageType, type Message } from '@openuidev/react-headless';

import { MessageBoundary } from '@/components/chat/message-boundary';
import { ToolActivity } from '@/components/chat/tool-activity';
import OpenUIMessage from '@/components/openui/openui-message';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  message: AssistantMessageType;
  allMessages: Message[];
  isStreaming: boolean;
  onFollowUp: (text: string) => void;
};

type MessageActionEvent = {
  type: string;
  params?: Record<string, unknown>;
  humanFriendlyMessage?: string;
};

export function AssistantMessage({ message, allMessages, isStreaming, onFollowUp }: Props) {
  const theme = useTheme();
  const scheme = useColorScheme();
  const { t } = useTranslation();

  const activities = useToolActivities(message, allMessages);
  const content = typeof message.content === 'string' ? message.content : '';

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
      {activities.map((activity) => (
        <ToolActivity key={activity.id} activity={activity} />
      ))}

      {content ? (
        <MessageBoundary fallback={t('chat.renderFailed')}>
          <OpenUIMessage
            content={content}
            isStreaming={isStreaming}
            themeMode={scheme === 'dark' ? 'dark' : 'light'}
            onAction={handleAction}
            dom={
              Platform.OS === 'web'
                ? undefined
                : { matchContents: true, scrollEnabled: false }
            }
          />
        </MessageBoundary>
      ) : isStreaming && activities.length === 0 ? (
        <ActivityIndicator color={theme.textSecondary} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.two,
  },
});
