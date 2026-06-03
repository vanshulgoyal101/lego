import { describe, it, expect } from '../../../test/test-harness.js';
import { Scrypt } from './index.js';

await describe('crypto/scrypt', async () => {
  await it('should correctly derive keys and verify passwords', async () => {
    const password = 'my_secure_password';
    const salt = 'random_salt_123';

    const derived = await Scrypt.hash(password, salt, 32, { N: 1024, r: 8, p: 1 });
    expect(derived.length).toBe(32);

    const isMatch = await Scrypt.verify(password, salt, derived, 32, { N: 1024, r: 8, p: 1 });
    expect(isMatch).toBe(true);

    const isMismatch = await Scrypt.verify('wrong_password', salt, derived, 32, { N: 1024, r: 8, p: 1 });
    expect(isMismatch).toBe(false);
  });
});
