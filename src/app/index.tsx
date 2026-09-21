import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AssistantMessage } from '@/components/chat/assistant-message';
import { Composer } from '@/components/chat/composer';
import { UserMessage } from '@/components/chat/user-message';
import { MenuButton } from '@/components/menu-button';
import { SettingsDrawer } from '@/components/settings/settings-drawer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useMostroChat, type ChatMessage } from '@/lib/use-mostro-chat';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { messages, isRunning, sendMessage } = useMostroChat();
  const [menuOpen, setMenuOpen] = useState(false);

  // Inverted list renders newest at the bottom, so feed it reversed order.
  const data = useMemo(() => [...messages].reverse(), [messages]);

  const renderItem = ({ item }: { item: ChatMessage }) =>
    item.role === 'user' ? (
      <UserMessage content={item.content} />
    ) : (
      <AssistantMessage message={item} onFollowUp={sendMessage} />
    );

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
            <Composer disabled={isRunning} onSend={sendMessage} />
          </View>
        </View>
      </KeyboardAvoidingView>
      <SettingsDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </ThemedView>
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
