import { describe, it, expect } from '../../../test/test-harness.js';
import { ChaCha20 } from './index.js';

await describe('crypto/chacha20', async () => {
  await it('should encrypt and decrypt back to the original message', () => {
    const key = new Uint8Array(32);
    const nonce = new Uint8Array(12);
    for (let i = 0; i < 32; i++) key[i] = i;
    for (let i = 0; i < 12; i++) nonce[i] = i + 10;

    const originalText = 'Hello world, this is a secure ChaCha20 stream cipher test!';
    const originalBytes = new TextEncoder().encode(originalText);

    // Encrypt
    const cipher = new ChaCha20(key, nonce);
    const encryptedBytes = cipher.encrypt(originalBytes);

    let isDifferent = false;
    for (let i = 0; i < encryptedBytes.length; i++) {
      if (encryptedBytes[i] !== originalBytes[i]) {
        isDifferent = true;
        break;
      }
    }
    expect(isDifferent).toBe(true);

    // Decrypt (with same initial key and nonce)
    const decipher = new ChaCha20(key, nonce);
    const decryptedBytes = decipher.decrypt(encryptedBytes);

    const decryptedText = new TextDecoder().decode(decryptedBytes);
    expect(decryptedText).toBe(originalText);
  });
});
