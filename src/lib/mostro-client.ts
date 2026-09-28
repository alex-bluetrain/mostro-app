import { Platform } from 'react-native';

import { MOSTRO_SERVER_URL } from '@/constants/auth';
import { logger } from '@/lib/logger';

export type MostroUser = {
  email: string;
  [key: string]: unknown;
};

// Without a token the request relies on the web session cookie (web only).
export function authHeaders(token: string | null | undefined): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// The server keeps one chat thread per client, `<email>:<channel>`, picked by
// this required header (mostro-server web-thread.ts). iOS will get `ios` when it ships.
function chatChannel(): 'web' | 'android' {
  if (Platform.OS === 'web' || Platform.OS === 'android') return Platform.OS;
  throw new Error(`Chat is not supported on ${Platform.OS} yet`);
}

export const CHAT_CHANNEL = chatChannel();

export function chatClientHeaders(): Record<string, string> {
  return { 'X-Mostro-Client': CHAT_CHANNEL };
}

export async function fetchMe(idToken?: string | null): Promise<MostroUser> {
  const endpoint = `${MOSTRO_SERVER_URL}/users/me`;

  let res: Response;
  try {
    res = await fetch(endpoint, {
      headers: authHeaders(idToken),
      credentials: 'include',
    });
  } catch (cause) {
    // fetch rejects on network failure (offline, DNS, tunnel down). status 0
    // mirrors the "network error" convention; detail goes to the log, not the UI.
    logger.error(`fetchMe network error: ${endpoint}`, cause);
    throw new BackendError(0);
  }

  if (res.status === 401 || res.status === 403) {
    throw new AuthError(res.status);
  }

  if (!res.ok) {
    logger.error(`fetchMe failed: ${endpoint} -> ${res.status}`);
    throw new BackendError(res.status);
  }

  return res.json();
}

export class AuthError extends Error {
  status: number;

  constructor(status: number) {
    super(`Not authorized (${status})`);
    this.name = 'AuthError';
    this.status = status;
  }
}

export class BackendError extends Error {
  // 0 = network failure (fetch rejected). Otherwise a non-OK, non-auth HTTP status.
  status: number;

  constructor(status: number) {
    super(`Backend request failed (${status})`);
    this.name = 'BackendError';
    this.status = status;
  }
}
