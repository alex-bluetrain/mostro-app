/**
 * Browsers only expose `crypto.randomUUID` in secure contexts. The native DOM
 * chat (src/components/chat/agent-chat.tsx) is served over plain http by Metro
 * in dev, so `@openuidev/react-headless` would crash minting message ids there.
 * `getRandomValues` has no such restriction; build an RFC 4122 v4 id from it.
 */
const globalCrypto = globalThis.crypto as Crypto | undefined;

if (globalCrypto && typeof globalCrypto.randomUUID !== 'function') {
  globalCrypto.randomUUID = () => {
    const bytes = globalCrypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}` as ReturnType<Crypto['randomUUID']>;
  };
}
