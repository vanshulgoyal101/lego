import { describe, it, expect } from '../../../test/test-harness.js';
import {sha256, hashPassword, verifyPassword} from './index.js';

  await describe('crypto/hash', async () => {
    await it('should generate SHA-256 string', async () => {
      const hash = await sha256('hello');
      expect(hash).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
    });

    await it('should hash and verify passwords securely', async () => {
      const result = await hashPassword('my-password');
      const isValid = await verifyPassword('my-password', result.hash, result.salt);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword('wrong-password', result.hash, result.salt);
      expect(isInvalid).toBe(false);
    });
  });
