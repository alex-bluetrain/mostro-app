let memoryToken: string | null = null;

export async function getIdToken(): Promise<string | null> {
  return memoryToken;
}

export async function setIdToken(token: string): Promise<void> {
  memoryToken = token;
}

export async function clearIdToken(): Promise<void> {
  memoryToken = null;
}
