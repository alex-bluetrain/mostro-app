import { SymbolView } from 'expo-symbols';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SettingsContent } from '@/components/settings/settings-content';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Panel is capped so it reads as a "sider" on wide web screens but still
// leaves the chat visible behind the backdrop.
const MAX_PANEL_WIDTH = 360;
const DURATION = 220;

export function SettingsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();

  const panelWidth = Math.min(MAX_PANEL_WIDTH, width * 0.85);

  // 0 = closed (off-screen left), 1 = open. `mounted` keeps the tree rendered
  // during the close animation, then unmounts so it never blocks touches.
  const progress = useSharedValue(0);
  const mounted = useSharedValue(open);

  useEffect(() => {
    if (open) {
      mounted.value = true;
      progress.value = withTiming(1, { duration: DURATION });
    } else {
      progress.value = withTiming(0, { duration: DURATION }, (finished) => {
        if (finished) mounted.value = false;
      });
    }
  }, [open, progress, mounted]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    // Hide from the tree once fully closed so it stops capturing pointers.
    display: mounted.value ? 'flex' : 'none',
  }));

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -panelWidth * (1 - progress.value) }],
    display: mounted.value ? 'flex' : 'none',
  }));

  const requestClose = () => {
    onClose();
  };

  // Web: hold the panel DOM node so we can move + trap focus while open.
  const panelRef = useRef<View>(null);

  // Web: close on Escape, standard for overlay panels.
  useEffect(() => {
    if (Platform.OS !== 'web' || !open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Web: move focus into the panel on open, trap Tab within it, and restore
  // focus to the previously focused element (the hamburger) on close.
  useEffect(() => {
    if (Platform.OS !== 'web' || !open) return;
    const node = panelRef.current as unknown as HTMLElement | null;
    // react-native-web forwards the DOM node; bail if we didn't get one.
    const panel =
      node && typeof node.querySelectorAll === 'function' ? node : null;
    if (!panel) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute('disabled'));

    // Defer past the open animation frame so focus sticks.
    const raf = requestAnimationFrame(() => focusables()[0]?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    panel.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      panel.removeEventListener('keydown', onKey);
      previouslyFocused?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[styles.backdrop, backdropStyle]}
        pointerEvents={open ? 'auto' : 'none'}>
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityLabel={t('chat.closeMenu')}
          onPress={requestClose}
        />
      </Animated.View>

      <Animated.View
        ref={panelRef}
        style={[styles.panel, { width: panelWidth }, panelStyle]}
        pointerEvents={open ? 'auto' : 'none'}>
        <ThemedView style={styles.panelInner}>
          <View
            style={[
              styles.header,
              { paddingTop: insets.top + Spacing.two, borderBottomColor: theme.border },
            ]}>
            <ThemedText type="subtitle" style={styles.headerTitle}>
              {t('settings.title')}
            </ThemedText>
            <Pressable
              onPress={requestClose}
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
              {Platform.OS === 'ios' ? (
                <SymbolView
                  name="xmark"
                  size={20}
                  tintColor={theme.textSecondary}
                  fallback={
                    <ThemedText type="subtitle" themeColor="textSecondary">
                      ✕
                    </ThemedText>
                  }
                />
              ) : (
                <ThemedText type="subtitle" themeColor="textSecondary">
                  ✕
                </ThemedText>
              )}
            </Pressable>
          </View>
          <View style={[styles.body, { paddingBottom: insets.bottom }]}>
            <SettingsContent onAfterSignOut={requestClose} />
          </View>
        </ThemedView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  panelInner: {
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    flexShrink: 1,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
});
