import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';

const isWeb = Platform.OS === 'web';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, error, requestReady, signIn, renderGoogleButton } =
    useAuth();
  const googleButtonRef = useRef<View>(null);

  useEffect(() => {
    if (!isWeb || user || loading || !requestReady) {
      return;
    }
    renderGoogleButton(googleButtonRef.current as unknown as HTMLElement | null);
  }, [user, loading, requestReady, renderGoogleButton]);

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
      <SafeAreaView style={styles.content}>
        <ThemedText type="title">mostro</ThemedText>
        <ThemedText type="default">Iniciá sesión para continuar</ThemedText>

        {isWeb ? (
          <View ref={googleButtonRef} style={styles.googleButtonContainer} />
        ) : (
          <Pressable
            style={styles.button}
            disabled={!requestReady}
            onPress={signIn}
          >
            <ThemedText type="smallBold" style={styles.buttonText}>
              Continuar con Google
            </ThemedText>
          </Pressable>
        )}

        {error && (
          <ThemedText type="small" style={styles.error}>
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
  googleButtonContainer: {
    marginTop: Spacing.three,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#3c87f7',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    marginTop: Spacing.three,
  },
  buttonText: {
    color: '#ffffff',
  },
  error: {
    color: '#e5484d',
    textAlign: 'center',
  },
});
