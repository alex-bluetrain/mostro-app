import '@openuidev/react-ui/index.css';

import { AgentInterface, openuiChatLibrary } from '@openuidev/react-ui';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { MenuButton } from '@/components/menu-button';
import { SettingsDrawer } from '@/components/settings/settings-drawer';
import { Spacing } from '@/constants/theme';
import { webDarkTheme, webLightTheme } from '@/constants/web-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/lib/auth-context';
import { CHAT_CHANNEL } from '@/lib/mostro-client';
import { fetchChatHistory } from '@/lib/mostro-history';
import { mostroLLM } from '@/lib/mostro-llm';
import { OpenChatThread, singleThreadStorage } from '@/lib/single-thread-chat';

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
  const storage = useMemo(() => singleThreadStorage(CHAT_CHANNEL, () => fetchChatHistory(email)), [email]);
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
        <OpenChatThread threadId={CHAT_CHANNEL} />
      </AgentInterface>

      <View style={styles.menuButton}>
        <MenuButton onPress={() => setMenuOpen(true)} />
      </View>
      <SettingsDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    position: 'absolute',
    top: Spacing.two,
    left: Spacing.two,
  },
});
