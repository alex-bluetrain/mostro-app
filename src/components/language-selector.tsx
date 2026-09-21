import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SUPPORTED_LANGUAGES, setAppLanguage, type AppLanguage } from '@/i18n';

const LABELS: Record<AppLanguage, string> = {
  en: 'EN',
  es: 'ES',
};

export function LanguageSelector() {
  const theme = useTheme();
  const { i18n } = useTranslation();
  // i18n.language can be a full tag (e.g. "en-US"); compare by base code.
  const current = i18n.language.split('-')[0];

  return (
    <View style={styles.container}>
      {SUPPORTED_LANGUAGES.map((lng) => {
        const active = lng === current;
        return (
          <Pressable
            key={lng}
            onPress={() => setAppLanguage(lng)}
            style={[
              styles.pill,
              {
                backgroundColor: active
                  ? theme.backgroundSelected
                  : theme.backgroundElement,
              },
            ]}>
            <ThemedText
              type="smallBold"
              themeColor={active ? 'text' : 'textSecondary'}>
              {LABELS[lng]}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  pill: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.full,
  },
});
