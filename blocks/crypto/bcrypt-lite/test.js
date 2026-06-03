import { describe, it, expect } from '../../../test/test-harness.js';
import { BcryptLite } from './index.js';

await describe('crypto/bcrypt-lite', async () => {
  await it('should hash and verify passwords correctly', async () => {
    const password = 'my_super_secret_password';
    const salt = BcryptLite.genSalt();

    const hash = await BcryptLite.hash(password, salt, 8); // 2^8 = 256 rounds
    expect(hash.startsWith('$2b$8$')).toBe(true);

    const match = await BcryptLite.verify(password, hash);
    expect(match).toBe(true);

    const mismatch = await BcryptLite.verify('wrong_password', hash);
    expect(mismatch).toBe(false);
  });
});
