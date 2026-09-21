import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { GOOGLE_CLIENT_ID } from '@/constants/auth';
import i18n from '@/i18n';
import { AuthError, fetchMe, type MostroUser } from '@/lib/mostro-client';
import { clearIdToken, getIdToken, setIdToken } from '@/lib/token-storage';

type AuthState = {
  user: MostroUser | null;
  loading: boolean;
  error: string | null;
  requestReady: boolean;
  signIn: () => void;
  // Dev-only: authenticate by pasting an API key (SimpleAuth token) instead of
  // going through Google. The key is sent as Bearer just like an id_token.
  signInWithApiKey: (apiKey: string) => Promise<void>;
  signOut: () => Promise<void>;
  renderGoogleButton: (parent: HTMLElement | null) => void;
};

type GoogleCredentialResponse = { credential?: string };

type GoogleIdApi = {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  prompt: () => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: 'standard' | 'icon';
      theme?: 'outline' | 'filled_blue' | 'filled_black';
      size?: 'large' | 'medium' | 'small';
      text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
      shape?: 'rectangular' | 'pill' | 'circle' | 'square';
      width?: number;
      locale?: string;
    },
  ) => void;
};

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleIdApi } };
  }
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MostroUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestReady, setRequestReady] = useState(false);
  const idApiRef = useRef<GoogleIdApi | null>(null);

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

  const handleCredential = useCallback(
    (response: GoogleCredentialResponse) => {
      const idToken = response.credential;
      if (!idToken) {
        setError(i18n.t('auth.noIdToken'));
        return;
      }
      (async () => {
        await setIdToken(idToken);
        await loadUser(idToken);
      })();
    },
    [loadUser],
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

  useEffect(() => {
    let cancelled = false;
    const tryInit = () => {
      const idApi = window.google?.accounts?.id;
      if (!idApi) {
        return false;
      }
      idApi.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
      });
      idApiRef.current = idApi;
      if (!cancelled) {
        setRequestReady(true);
      }
      return true;
    };

    if (tryInit()) {
      return;
    }

    const interval = setInterval(() => {
      if (tryInit()) {
        clearInterval(interval);
      }
    }, 200);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [handleCredential]);

  const renderGoogleButton = useCallback(
    (parent: HTMLElement | null) => {
      if (!parent || !idApiRef.current) {
        return;
      }
      parent.innerHTML = '';
      idApiRef.current.renderButton(parent, {
        type: 'standard',
        theme: 'filled_blue',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        locale: i18n.language,
      });
    },
    [],
  );

  const signIn = useCallback(() => {
    setError(null);
    idApiRef.current?.prompt();
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
    setUser(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        requestReady,
        signIn,
        signInWithApiKey,
        signOut,
        renderGoogleButton,
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
