import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatProvider, useThread, type Message } from '@openuidev/react-headless';

import { AssistantMessage } from '@/components/chat/assistant-message';
import { Composer } from '@/components/chat/composer';
import { UserMessage } from '@/components/chat/user-message';
import { MenuButton } from '@/components/menu-button';
import { SettingsDrawer } from '@/components/settings/settings-drawer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { mostroLLM } from '@/lib/mostro-llm';

function Chat() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const messages = useThread((s) => s.messages);
  const isRunning = useThread((s) => s.isRunning);
  const processMessage = useThread((s) => s.processMessage);
  const [menuOpen, setMenuOpen] = useState(false);

  // Only the final assistant message is still streaming while a run is active.
  const lastMessageId = messages.length ? messages[messages.length - 1].id : null;

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isRunning) return;
      processMessage({ role: 'user', content: trimmed });
    },
    [isRunning, processMessage],
  );

  // Inverted list renders newest at the bottom, so feed it reversed order.
  const data = useMemo(() => [...messages].reverse(), [messages]);

  const renderItem = ({ item }: { item: Message }) =>
    item.role === 'user' ? (
      <UserMessage content={typeof item.content === 'string' ? item.content : ''} />
    ) : item.role === 'assistant' ? (
      <AssistantMessage
        message={item}
        allMessages={messages}
        isStreaming={isRunning && item.id === lastMessageId}
        onFollowUp={send}
      />
    ) : null;

  return (
    <ThemedView style={[styles.root, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}>
        <View style={styles.header}>
          <MenuButton onPress={() => setMenuOpen(true)} />
        </View>
        <View style={styles.centered}>
          {data.length === 0 ? (
            <View style={styles.empty}>
              <ThemedText type="subtitle">{t('chat.emptyState')}</ThemedText>
            </View>
          ) : (
            <FlatList
              data={data}
              inverted
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              keyboardDismissMode="interactive"
            />
          )}
          <View style={{ paddingBottom: insets.bottom }}>
            <Composer disabled={isRunning} onSend={send} />
          </View>
        </View>
      </KeyboardAvoidingView>
      <SettingsDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </ThemedView>
  );
}

export default function ChatScreen() {
  return (
    <ChatProvider llm={mostroLLM}>
      <Chat />
    </ChatProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
});
