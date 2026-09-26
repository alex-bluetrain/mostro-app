import '@openuidev/react-ui/index.css';

import { AgentInterface, openuiChatLibrary } from '@openuidev/react-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { SettingsContent } from '@/components/settings/settings-content';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { webDarkTheme, webLightTheme } from '@/constants/web-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { mostroLLM } from '@/lib/mostro-llm';

const MAX_MODAL_WIDTH = 420;

/**
 * Web chat screen.
 *
 * Uses `AgentInterface` (react-ui, DOM-native on web) instead of the
 * hand-built `Renderer` + FlatList screen used on native. This gives us
 * incremental streaming, the tool-call timeline, sidebar and composer for free.
 *
 * Settings live at the foot of AgentInterface's own sidebar (the ChatGPT/Claude
 * pattern) and open the shared `SettingsContent` in a centered modal. Native
 * keeps `index.tsx` with its left drawer. See `mobile_agentinterface` task.
 */
export default function ChatScreen() {
  const scheme = useColorScheme();
  const { t } = useTranslation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <AgentInterface
        llm={mostroLLM}
        componentLibrary={openuiChatLibrary}
        agentName="mostro"
        theme={{
          mode: scheme === 'dark' ? 'dark' : 'light',
          lightTheme: webLightTheme,
          darkTheme: webDarkTheme,
        }}>
        <AgentInterface.Sidebar>
          <AgentInterface.SidebarHeader />
          <AgentInterface.SidebarContent>
            <AgentInterface.NewChatButton />
            <AgentInterface.SidebarSeparator />
            <AgentInterface.ThreadList />
          </AgentInterface.SidebarContent>
          <AgentInterface.SidebarSeparator />
          <AgentInterface.SidebarItem
            icon={<span aria-hidden>⚙</span>}
            onClick={() => setSettingsOpen(true)}>
            {t('settings.title')}
          </AgentInterface.SidebarItem>
        </AgentInterface.Sidebar>
      </AgentInterface>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}

function SettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Stop propagation so clicks inside the card don't close the modal. */}
        <Pressable style={styles.cardWrap} onPress={() => {}}>
          <ThemedView style={styles.card}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
              <ThemedText type="subtitle">{t('settings.title')}</ThemedText>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel={t('chat.closeMenu')}
                hitSlop={Spacing.two}
                style={({ hovered, pressed }) => [
                  styles.closeButton,
                  Platform.OS === 'web' && ({ cursor: 'pointer' } as object),
                  (hovered || pressed) && {
                    backgroundColor: theme.backgroundSelected,
                  },
                ]}>
                <ThemedText type="subtitle" themeColor="textSecondary">
                  ✕
                </ThemedText>
              </Pressable>
            </View>
            <SettingsContent onAfterSignOut={onClose} />
          </ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  cardWrap: {
    width: '100%',
    maxWidth: MAX_MODAL_WIDTH,
    maxHeight: '85%',
  },
  card: {
    borderRadius: Radius.card,
    borderCurve: 'continuous',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
