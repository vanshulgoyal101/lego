import { describe, it, expect } from '../../../test/test-harness.js';
import { SHA3 } from './index.js';

await describe('crypto/sha3', async () => {
  await it('should correctly compute standard SHA3-256 and SHA3-512 hashes', () => {
    // Empty string SHA3-256 standard vector
    const empty256 = SHA3.sha256('');
    expect(empty256).toBe('a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a');

    // Empty string SHA3-512 standard vector
    const empty512 = SHA3.sha512('');
    expect(empty512).toBe('a69f73cca23a9ac5c8b567dc185a756e97c982164fe25859e0d1dcc1475c80a615b2123af1f5f94c11e3e9402c3ac558f500199d95b6d3e301758586281dcd26');

    // Input string check
    const hello = SHA3.sha256('hello');
    expect(hello.length).toBe(64);
  });
});
