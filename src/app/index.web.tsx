import '@openuidev/react-ui/index.css';

import { useThreadList } from '@openuidev/react-headless';
import { AgentInterface, openuiChatLibrary } from '@openuidev/react-ui';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { MenuButton } from '@/components/menu-button';
import { SettingsDrawer } from '@/components/settings/settings-drawer';
import { CHAT_THREAD_ID } from '@/constants/chat';
import { Spacing } from '@/constants/theme';
import { webDarkTheme, webLightTheme } from '@/constants/web-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/lib/auth-context';
import { mostroHistoryStorage } from '@/lib/mostro-history';
import { mostroLLM } from '@/lib/mostro-llm';

/**
 * Web chat screen.
 *
 * Uses `AgentInterface` (react-ui, DOM-native on web) instead of the
 * hand-built `Renderer` + FlatList screen used on native. This gives us
 * incremental streaming, the tool-call timeline and composer for free.
 *
 * There is one server thread per user, so AgentInterface's sidebar is hidden
 * (see global.css). A menu button opens the same `SettingsDrawer` native uses.
 */
export default function ChatScreen() {
  const scheme = useColorScheme();
  const { user } = useAuth();
  const email = user?.email ?? '';
  const storage = useMemo(() => mostroHistoryStorage(email), [email]);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <AgentInterface
        key={email}
        llm={mostroLLM}
        storage={storage}
        componentLibrary={openuiChatLibrary}
        agentName="mostro"
        theme={{
          mode: scheme === 'dark' ? 'dark' : 'light',
          lightTheme: webLightTheme,
          darkTheme: webDarkTheme,
        }}>
        <LoadHistory />
      </AgentInterface>

      <View style={styles.menuButton}>
        <MenuButton onPress={() => setMenuOpen(true)} />
      </View>
      <SettingsDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

// One server thread per user: open it on mount so past messages load.
function LoadHistory() {
  const selectThread = useThreadList((s) => s.selectThread);
  useEffect(() => {
    selectThread(CHAT_THREAD_ID);
  }, [selectThread]);
  return null;
}

const styles = StyleSheet.create({
  menuButton: {
    position: 'absolute',
    top: Spacing.two,
    left: Spacing.two,
  },
});
