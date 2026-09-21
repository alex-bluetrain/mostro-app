import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LanguageSelector } from '@/components/language-selector';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DEV_API_KEY_LOGIN } from '@/constants/auth';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth-context';

const isWeb = Platform.OS === 'web';

function ApiKeyLogin() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { signInWithApiKey } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      await signInWithApiKey(apiKey);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.devBox, { borderTopColor: theme.border }]}>
      <ThemedText type="small" style={styles.devLabel}>
        {t('auth.devApiKeyLabel')}
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          { borderColor: theme.border, color: theme.placeholder },
          Platform.OS === 'web' && { fontFamily: Fonts.sans },
        ]}
        value={apiKey}
        onChangeText={setApiKey}
        placeholder="sk-..."
        placeholderTextColor={theme.placeholder}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
        editable={!submitting}
        onSubmitEditing={submit}
      />
      <Pressable
        style={[styles.button, { backgroundColor: theme.tint }]}
        disabled={submitting || !apiKey.trim()}
        onPress={submit}
      >
        <ThemedText type="smallBold" style={{ color: theme.onTint }}>
          {submitting ? t('auth.verifying') : t('auth.useApiKey')}
        </ThemedText>
      </Pressable>
    </View>
  );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { user, loading, error, requestReady, signIn, renderGoogleButton } =
    useAuth();
  const googleButtonRef = useRef<View>(null);

  // Re-runs on language change so the GIS widget re-renders in the new locale.
  useEffect(() => {
    if (!isWeb || user || loading || !requestReady) {
      return;
    }
    renderGoogleButton(googleButtonRef.current as unknown as HTMLElement | null);
  }, [user, loading, requestReady, renderGoogleButton, i18n.language]);

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  return (
    <ThemedView style={styles.centered}>
      <SafeAreaView style={styles.languageCorner}>
        <LanguageSelector />
      </SafeAreaView>
      <SafeAreaView style={styles.content}>
        <ThemedText type="title">mostro</ThemedText>
        <ThemedText type="default">{t('auth.signInToContinue')}</ThemedText>

        {isWeb ? (
          <View ref={googleButtonRef} style={styles.googleButtonContainer} />
        ) : (
          <Pressable
            style={[styles.button, { backgroundColor: theme.tint }]}
            disabled={!requestReady}
            onPress={signIn}
          >
            <ThemedText type="smallBold" style={{ color: theme.onTint }}>
              {t('auth.continueWithGoogle')}
            </ThemedText>
          </Pressable>
        )}

        {DEV_API_KEY_LOGIN && <ApiKeyLogin />}

        {error && (
          <ThemedText type="small" style={[styles.error, { color: theme.error }]}>
            {error}
          </ThemedText>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  languageCorner: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
  },
  googleButtonContainer: {
    marginTop: Spacing.three,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.card,
    borderCurve: 'continuous',
    marginTop: Spacing.three,
  },
  error: {
    textAlign: 'center',
  },
  devBox: {
    marginTop: Spacing.four,
    width: 280,
    gap: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.three,
  },
  devLabel: {
    textAlign: 'center',
    opacity: 0.7,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
