import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { GOOGLE_WEB_CLIENT_ID } from '@/constants/auth';
import { AuthError, fetchMe, type MostroUser } from '@/lib/mostro-client';
import { clearIdToken, getIdToken, setIdToken } from '@/lib/token-storage';

WebBrowser.maybeCompleteAuthSession();

type AuthState = {
  user: MostroUser | null;
  loading: boolean;
  error: string | null;
  requestReady: boolean;
  signIn: () => void;
  signOut: () => Promise<void>;
  renderGoogleButton: (parent: HTMLElement | null) => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MostroUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
  });

  const loadUser = useCallback(async (idToken: string) => {
    setError(null);
    try {
      const me = await fetchMe(idToken);
      setUser(me);
    } catch (e) {
      if (e instanceof AuthError) {
        await clearIdToken();
        setUser(null);
        setError('Tu email no está invitado a mostro.');
      } else {
        setError(e instanceof Error ? e.message : 'Error desconocido');
      }
    }
  }, []);

  useEffect(() => {
    (async () => {
      const stored = await getIdToken();
      if (stored) {
        await loadUser(stored);
      }
      setLoading(false);
    })();
  }, [loadUser]);

  useEffect(() => {
    if (response?.type !== 'success') {
      return;
    }
    const idToken = response.params.id_token;
    if (!idToken) {
      setError('No se recibió id_token de Google.');
      return;
    }
    (async () => {
      await setIdToken(idToken);
      await loadUser(idToken);
    })();
  }, [response, loadUser]);

  const signIn = useCallback(() => {
    setError(null);
    promptAsync();
  }, [promptAsync]);

  const signOut = useCallback(async () => {
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
        requestReady: !!request,
        signIn,
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
