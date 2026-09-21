import { MOSTRO_URL } from '@/constants/auth';
import { logger } from '@/lib/logger';

export type MostroUser = {
  email: string;
  [key: string]: unknown;
};

export async function fetchMe(idToken: string): Promise<MostroUser> {
  const endpoint = `${MOSTRO_URL}/users/me`;

  let res: Response;
  try {
    res = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
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
