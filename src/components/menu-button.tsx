import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// SF Symbols only render on iOS. On Android/web fall back to a hamburger glyph
// so the control is never invisible (expo-native-ui icons guidance).
const MENU_GLYPH = '☰';

export function MenuButton({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('chat.openMenu')}
      hitSlop={Spacing.two}
      style={({ hovered, pressed }) => [
        styles.button,
        Platform.OS === 'web' && ({ cursor: 'pointer' } as object),
        (hovered || pressed) && { backgroundColor: theme.backgroundSelected },
      ]}>
      {Platform.OS === 'ios' ? (
        <SymbolView
          name="line.3.horizontal"
          size={24}
          tintColor={theme.textSecondary}
          fallback={
            <ThemedText type="subtitle" themeColor="textSecondary">
              {MENU_GLYPH}
            </ThemedText>
          }
        />
      ) : (
        <ThemedText type="subtitle" themeColor="textSecondary">
          {MENU_GLYPH}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
