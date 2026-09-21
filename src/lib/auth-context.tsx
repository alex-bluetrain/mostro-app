import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { GOOGLE_CLIENT_ID } from '@/constants/auth';
import i18n from '@/i18n';
import { logger } from '@/lib/logger';
import { AuthError, fetchMe, type MostroUser } from '@/lib/mostro-client';
import { clearIdToken, getIdToken, setIdToken } from '@/lib/token-storage';

GoogleSignin.configure({
  webClientId: GOOGLE_CLIENT_ID,
});

export type AuthState = {
  user: MostroUser | null;
  loading: boolean;
  error: string | null;
  // Solo lo usa la variante web (GIS renderButton). En native es no-op para
  // que el AuthGate compartido tenga un contrato único entre plataformas.
  requestReady: boolean;
  signIn: () => void;
  // Dev-only: autenticar pegando una API key (SimpleAuth token) en vez de
  // pasar por Google. La key se manda como Bearer igual que un id_token.
  signInWithApiKey: (apiKey: string) => Promise<void>;
  signOut: () => Promise<void>;
  renderGoogleButton: (parent: HTMLElement | null) => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MostroUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // `silent` is used by the boot session-check: a stale stored token or an
  // unreachable backend on cold start must NOT paint an error — just fall back
  // to the login screen. Explicit user actions (Google / API key) pass
  // silent:false so the friendly message is shown.
  const loadUser = useCallback(
    async (idToken: string, opts?: { silent?: boolean }) => {
      const silent = opts?.silent ?? false;
      setError(null);
      try {
        const me = await fetchMe(idToken);
        setUser(me);
      } catch (e) {
        if (e instanceof AuthError) {
          await clearIdToken();
          setUser(null);
          setError(silent ? null : i18n.t('auth.notInvited'));
        } else {
          // BackendError / network / unknown. Technical detail is already
          // logged in fetchMe; the UI only ever sees the friendly string.
          setError(silent ? null : i18n.t('auth.connectionFailed'));
        }
      }
    },
    [],
  );

  useEffect(() => {
    (async () => {
      const stored = await getIdToken();
      if (stored) {
        await loadUser(stored, { silent: true });
      }
      setLoading(false);
    })();
  }, [loadUser]);

  const signIn = useCallback(async () => {
    setError(null);
    try {
      await GoogleSignin.hasPlayServices();
      const result = await GoogleSignin.signIn();
      const idToken = result.data?.idToken;
      if (!idToken) {
        setError(i18n.t('auth.noIdToken'));
        return;
      }
      await setIdToken(idToken);
      await loadUser(idToken);
    } catch (e: any) {
      if (e?.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }
      logger.error('Google sign-in failed', e);
      setError(i18n.t('auth.signInFailed'));
    }
  }, [loadUser]);

  const signInWithApiKey = useCallback(
    async (apiKey: string) => {
      const key = apiKey.trim();
      if (!key) {
        setError(i18n.t('auth.enterApiKey'));
        return;
      }
      await setIdToken(key);
      await loadUser(key);
    },
    [loadUser],
  );

  const signOut = useCallback(async () => {
    try {
      await GoogleSignin.signOut();
    } catch {
      // ignore
    }
    await clearIdToken();
    setUser(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        requestReady: true,
        signIn,
        signInWithApiKey,
        signOut,
        renderGoogleButton: () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
