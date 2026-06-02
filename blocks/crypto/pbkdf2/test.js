import { describe, it, expect } from '../../../test/test-harness.js';
import { pbkdf2Sync, pbkdf2 } from './index.js';

await describe('crypto/pbkdf2', async () => {
  await it('should derive the correct key synchronously and asynchronously', async () => {
    const password = 'mySecurePassword123';
    const salt = 'unique_salt_value';
    const iterations = 1000;
    const keylen = 32;

    const keySync = pbkdf2Sync(password, salt, iterations, keylen, 'sha256');
    expect(keySync.length).toBe(32);

    const keyAsync = await pbkdf2(password, salt, iterations, keylen, 'sha256');
    expect(keyAsync.length).toBe(32);

    // Verify they match
    expect(keySync.toString('hex')).toBe(keyAsync.toString('hex'));
  });

  await it('should match standard test vector', () => {
    // Standard test vector: password="password", salt="salt", iterations=2, keylen=20, digest="sha1"
    // Expected: ea6c014dc72d6f8ccd1ed92ace1d41f0d8de8957
    const derived = pbkdf2Sync('password', 'salt', 2, 20, 'sha1');
    expect(derived.toString('hex')).toBe('ea6c014dc72d6f8ccd1ed92ace1d41f0d8de8957');
  });
});
