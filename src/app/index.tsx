import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AgentChat from '@/components/chat/agent-chat';
import { MenuButton } from '@/components/menu-button';
import { SettingsDrawer } from '@/components/settings/settings-drawer';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/lib/auth-context';
import { cancelChatRun, loadChatHistory, pullChatRun, startChatRun } from '@/lib/chat-bridge';

/**
 * Native chat screen: web's `AgentInterface` in one webview (AgentChat), under
 * a header with the native menu button that opens the settings drawer.
 */
export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const { user } = useAuth();
  const email = user?.email ?? '';
  const [menuOpen, setMenuOpen] = useState(false);

  const loadHistory = useCallback(() => loadChatHistory(email), [email]);

  return (
    <ThemedView style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <MenuButton onPress={() => setMenuOpen(true)} />
      </View>
      <AgentChat
        key={email}
        themeMode={scheme === 'dark' ? 'dark' : 'light'}
        startRun={startChatRun}
        pullRun={pullChatRun}
        cancelRun={cancelChatRun}
        loadHistory={loadHistory}
        dom={{ style: styles.root }}
      />

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
