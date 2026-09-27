import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

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
      <SymbolView
        name={{ ios: 'line.3.horizontal', android: 'menu', web: 'menu' }}
        size={24}
        tintColor={theme.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
