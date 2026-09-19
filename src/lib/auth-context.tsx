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
  signOut: () => Promise<void>;
  renderGoogleButton: (parent: HTMLElement | null) => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MostroUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const signIn = useCallback(async () => {
    setError(null);
    try {
      await GoogleSignin.hasPlayServices();
      const result = await GoogleSignin.signIn();
      const idToken = result.data?.idToken;
      if (!idToken) {
        setError('No se recibió id_token de Google.');
        return;
      }
      await setIdToken(idToken);
      await loadUser(idToken);
    } catch (e: any) {
      if (e?.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }
      setError(e instanceof Error ? e.message : 'Error al iniciar sesión.');
    }
  }, [loadUser]);

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
