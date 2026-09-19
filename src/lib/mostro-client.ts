import { MOSTRO_URL } from '@/constants/auth';

export type MostroUser = {
  email: string;
  [key: string]: unknown;
};

export async function fetchMe(idToken: string): Promise<MostroUser> {
  const res = await fetch(`${MOSTRO_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (res.status === 401 || res.status === 403) {
    throw new AuthError(res.status);
  }

  if (!res.ok) {
    throw new Error(`mostro /users/me failed: ${res.status}`);
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
