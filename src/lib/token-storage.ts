import * as SecureStore from 'expo-secure-store';

import { ID_TOKEN_STORAGE_KEY } from '@/constants/auth';

export async function getIdToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ID_TOKEN_STORAGE_KEY);
}

export async function setIdToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(ID_TOKEN_STORAGE_KEY, token);
}

export async function clearIdToken(): Promise<void> {
  await SecureStore.deleteItemAsync(ID_TOKEN_STORAGE_KEY);
}
