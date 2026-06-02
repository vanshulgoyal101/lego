import { describe, it, expect } from '../../../test/test-harness.js';
import { RSALight } from './index.js';

await describe('crypto/rsa-light', async () => {
  await it('should correctly encrypt and decrypt a message', () => {
    // Generate keys using standard default primes (61, 53, 17)
    const keys = RSALight.generateKeys();
    const rsa = new RSALight(keys);

    const message = 65n; // BigInt message smaller than modulus n = 61 * 53 = 3233
    const ciphertext = rsa.encrypt(message);
    const decrypted = rsa.decrypt(ciphertext);

    expect(decrypted).toBe(message);
  });

  await it('should sign and verify messages correctly', () => {
    const keys = RSALight.generateKeys(61n, 53n, 17n);
    const rsa = new RSALight(keys);

    const message = 120n;
    const signature = rsa.sign(message);
    
    expect(rsa.verify(message, signature)).toBe(true);
    expect(rsa.verify(121n, signature)).toBe(false);
  });
});
