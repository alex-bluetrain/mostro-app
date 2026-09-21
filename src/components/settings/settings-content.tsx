import Constants from 'expo-constants';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SUPPORTED_LANGUAGES, setAppLanguage, type AppLanguage } from '@/i18n';
import { useAuth } from '@/lib/auth-context';

const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  en: 'English',
  es: 'Español',
};

function RadioMark({ selected }: { selected: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.radioOuter,
        { borderColor: selected ? theme.tint : theme.border },
      ]}>
      {selected ? (
        <View style={[styles.radioInner, { backgroundColor: theme.tint }]} />
      ) : null}
    </View>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <ThemedText
        type="smallBold"
        themeColor="textSecondary"
        style={styles.sectionTitle}>
        {title.toUpperCase()}
      </ThemedText>
      <ThemedView
        style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        {children}
      </ThemedView>
    </View>
  );
}

type SettingsRowProps = {
  label: string;
  labelColor?: string;
  secondary?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  first?: boolean;
  muted?: boolean;
};

function SettingsRow({
  label,
  labelColor,
  secondary,
  trailing,
  onPress,
  first,
  muted,
}: SettingsRowProps) {
  const theme = useTheme();

  const content = (
    <>
      <View style={styles.rowLabel}>
        <ThemedText
          type={muted ? 'small' : undefined}
          themeColor={muted ? 'textSecondary' : undefined}
          style={labelColor ? { color: labelColor } : undefined}>
          {label}
        </ThemedText>
        {secondary ? (
          <ThemedText themeColor={muted ? 'text' : 'textSecondary'}>
            {secondary}
          </ThemedText>
        ) : null}
      </View>
      {trailing ? <View style={styles.rowTrailing}>{trailing}</View> : null}
    </>
  );

  const rowStyle = [
    styles.row,
    !first && {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.border,
    },
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        // `hovered` is web-only (react-native-web); native ignores it.
        style={({ pressed, hovered }) => [
          ...rowStyle,
          Platform.OS === 'web' && ({ cursor: 'pointer' } as object),
          hovered && { backgroundColor: theme.backgroundSelected },
          pressed && { backgroundColor: theme.backgroundSelected },
        ]}>
        {content}
      </Pressable>
    );
  }

  return <View style={rowStyle}>{content}</View>;
}

export function SettingsContent({ onAfterSignOut }: { onAfterSignOut?: () => void }) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();

  // i18n.language can be a full tag (e.g. "en-US"); compare by base code.
  const current = i18n.language.split('-')[0];
  const version = Constants.expoConfig?.version ?? '';

  const performSignOut = async () => {
    await signOut();
    onAfterSignOut?.();
  };

  const confirmSignOut = () => {
    if (Platform.OS === 'web') {
      const ok =
        typeof window !== 'undefined' &&
        window.confirm(t('settings.signOutConfirmMessage'));
      if (ok) void performSignOut();
      return;
    }
    Alert.alert(
      t('settings.signOutConfirmTitle'),
      t('settings.signOutConfirmMessage'),
      [
        { text: t('settings.cancel'), style: 'cancel' },
        {
          text: t('settings.signOut'),
          style: 'destructive',
          onPress: () => void performSignOut(),
        },
      ],
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <SettingsSection title={t('settings.language')}>
        {SUPPORTED_LANGUAGES.map((lng, index) => (
          <SettingsRow
            key={lng}
            first={index === 0}
            label={LANGUAGE_LABELS[lng]}
            onPress={() => setAppLanguage(lng)}
            trailing={<RadioMark selected={lng === current} />}
          />
        ))}
      </SettingsSection>

      <SettingsSection title={t('settings.account')}>
        <SettingsRow
          first
          muted
          label={t('settings.email')}
          secondary={user?.email ?? ''}
        />
        <SettingsRow
          label={t('settings.signOut')}
          labelColor={theme.error}
          onPress={confirmSignOut}
        />
      </SettingsSection>

      <SettingsSection title={t('settings.about')}>
        <SettingsRow
          first
          label={t('settings.version')}
          trailing={
            <ThemedText type="small" themeColor="textSecondary">
              {version}
            </ThemedText>
          }
        />
      </SettingsSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.three,
    gap: Spacing.four,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    paddingHorizontal: Spacing.two,
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: Radius.card,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.three,
  },
  rowLabel: {
    flexShrink: 1,
    gap: Spacing.half,
  },
  rowTrailing: {
    flexShrink: 0,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
