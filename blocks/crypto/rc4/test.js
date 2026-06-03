import { describe, it, expect } from '../../../test/test-harness.js';
import { RC4 } from './index.js';

await describe('crypto/rc4', async () => {
  await it('should correctly encrypt and decrypt a message', () => {
    const key = 'Key';
    const message = 'Wiki';
    
    // Test standard RC4 test vector
    // Key: "Key", Plaintext: "Wiki"
    // Ciphertext should be: bc f6 1c e8 (in hex)
    const hex = RC4.encryptToHex(key, message);
    expect(hex.toLowerCase()).toBe('bcf61ce8');

    const decrypted = RC4.decryptFromHex(key, hex);
    expect(decrypted).toBe(message);
  });

  await it('should work symmetrically', () => {
    const key = 'SecretPassword';
    const message = 'Hello, this is a secret message!';
    
    const ciphertext = RC4.encrypt(key, message);
    const decrypted = RC4.encrypt(key, ciphertext); // symmetric stream XOR

    expect(decrypted.toString('utf8')).toBe(message);
  });
});
