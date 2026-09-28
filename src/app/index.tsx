import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AgentChat from '@/components/chat/agent-chat';
import { MenuButton } from '@/components/menu-button';
import { SettingsDrawer } from '@/components/settings/settings-drawer';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/lib/auth-context';
import { cancelAllChatRuns, cancelChatRun, pullChatRun, startChatRun } from '@/lib/chat-bridge';
import { CHAT_CHANNEL } from '@/lib/mostro-client';
import { fetchChatHistory } from '@/lib/mostro-history';

/**
 * Native chat screen: web's `AgentInterface` in one webview (AgentChat), under
 * a header with the native menu button that opens the settings drawer.
 * Why a webview here when the rest of the app is native: docs/NATIVE-CHAT.md.
 */
export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const { user } = useAuth();
  const email = user?.email ?? '';
  const [menuOpen, setMenuOpen] = useState(false);

  const loadHistory = useCallback(() => fetchChatHistory(email), [email]);
  // AgentChat remounts per user (key={email}); stop the old one's streams.
  useEffect(() => cancelAllChatRuns, [email]);

  return (
    <ThemedView style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <MenuButton onPress={() => setMenuOpen(true)} />
      </View>
      {/* Edge-to-edge Android ignores adjustResize, so the keyboard would cover
          the webview's composer. Shrink the webview with the keyboard's real
          frame instead. */}
      <KeyboardAvoidingView style={styles.root} behavior="padding">
        <AgentChat
          key={email}
          threadId={CHAT_CHANNEL}
          themeMode={scheme === 'dark' ? 'dark' : 'light'}
          startRun={startChatRun}
          pullRun={pullChatRun}
          cancelRun={cancelChatRun}
          loadHistory={loadHistory}
          dom={{ style: styles.root }}
        />
      </KeyboardAvoidingView>

      <SettingsDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
});
