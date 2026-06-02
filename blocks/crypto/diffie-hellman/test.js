import { describe, it, expect } from '../../../test/test-harness.js';
import { DiffieHellman, modPow } from './index.js';

await describe('crypto/diffie-hellman', async () => {
  await it('should compute identical shared secrets for two parties using default 2048-bit prime', () => {
    const alice = new DiffieHellman();
    const bob = new DiffieHellman();

    const alicePub = alice.generateKeys();
    const bobPub = bob.generateKeys();

    const aliceSecret = alice.computeSecret(bobPub);
    const bobSecret = bob.computeSecret(alicePub);

    expect(aliceSecret).toBe(bobSecret);
    expect(aliceSecret.length > 0).toBe(true);
  });

  await it('should compute correct keys on a small custom prime', () => {
    // Prime 23, Generator 5
    const alice = new DiffieHellman(23n, 5n);
    const bob = new DiffieHellman(23n, 5n);

    // Manually set private keys for deterministic testing
    alice.privateKey = 6n; // Alice's private key
    alice.publicKey = modPow(5n, 6n, 23n); // 5^6 % 23 = 15625 % 23 = 8

    bob.privateKey = 15n; // Bob's private key
    bob.publicKey = modPow(5n, 15n, 23n); // 5^15 % 23 = 19

    expect(alice.publicKey).toBe(8n);
    expect(bob.publicKey).toBe(19n);

    const aliceSecret = alice.computeSecret(bob.publicKey); // 19^6 % 23 = 2
    const bobSecret = bob.computeSecret(alice.publicKey);   // 8^15 % 23 = 2

    expect(aliceSecret).toBe('2');
    expect(bobSecret).toBe('2');
  });
});
