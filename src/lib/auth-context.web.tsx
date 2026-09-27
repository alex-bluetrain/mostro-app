import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { MOSTRO_SERVER_URL } from '@/constants/auth';
import i18n from '@/i18n';
import type { AuthState } from '@/lib/auth-context';
import { AuthError, fetchMe, type MostroUser } from '@/lib/mostro-client';
import { clearIdToken, getIdToken, setIdToken } from '@/lib/token-storage';

// Web auth: Google redirect login handled by the server, which answers with an
// HttpOnly session cookie (mostro-server auth.route.ts). The app never sees a
// token; it just calls the API with credentials: 'include'. MOSTRO_SERVER_URL
// must be same-origin (the Pages proxy at /api) so the cookie is first-party.
// The dev API-key login still sends a Bearer token kept in memory.

// Reads and strips ?login_error= left by the server's callback redirect.
function takeLoginError(): string | null {
  const url = new URL(window.location.href);
  const code = url.searchParams.get('login_error');
  if (!code) return null;
  url.searchParams.delete('login_error');
  window.history.replaceState(null, '', url.toString());
  return i18n.t(code === 'not_invited' ? 'auth.notInvited' : 'auth.signInFailed');
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MostroUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // `silent` is used by the boot session-check: no cookie or an unreachable
  // backend on cold start must NOT paint an error — just fall back to the
  // login screen.
  const loadUser = useCallback(
    async (token: string | null, opts?: { silent?: boolean }) => {
      const silent = opts?.silent ?? false;
      setError(null);
      try {
        setUser(await fetchMe(token));
      } catch (e) {
        if (e instanceof AuthError) {
          await clearIdToken();
          setUser(null);
          setError(silent ? null : i18n.t('auth.notInvited'));
        } else {
          setError(silent ? null : i18n.t('auth.connectionFailed'));
        }
      }
    },
    [],
  );

  useEffect(() => {
    (async () => {
      const loginError = takeLoginError();
      await loadUser(await getIdToken(), { silent: true });
      if (loginError) setError(loginError);
      setLoading(false);
    })();
  }, [loadUser]);

  const signIn = useCallback(() => {
    window.location.assign(`${MOSTRO_SERVER_URL}/auth/google/login`);
  }, []);

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
    await clearIdToken();
    try {
      await fetch(`${MOSTRO_SERVER_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Offline: the cookie expires on its own; the UI still logs out.
    }
    setUser(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, signIn, signInWithApiKey, signOut }}
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
