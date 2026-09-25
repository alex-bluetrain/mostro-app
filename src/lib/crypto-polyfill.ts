import * as Crypto from 'expo-crypto';
import 'react-native-get-random-values';

/**
 * Hermes exposes `crypto.getRandomValues` (via react-native-get-random-values)
 * but not `crypto.randomUUID`, which `@openuidev/react-headless` calls to mint
 * message and thread ids. Fill the gap with expo-crypto's UUID generator.
 *
 * Imported for its side effect at the top of the root layout, before any code
 * that touches the store runs.
 */
const globalCrypto = globalThis.crypto as { randomUUID?: () => string } | undefined;

if (globalCrypto && typeof globalCrypto.randomUUID !== 'function') {
  globalCrypto.randomUUID = () => Crypto.randomUUID();
}
