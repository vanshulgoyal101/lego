import { describe, it, expect } from '../../../test/test-harness.js';
import {HMAC} from './index.js';

  await describe('crypto/hmac', async () => {
    await it('should sign messages and verify signature correctness', () => {
      const signer = new HMAC('my-secret-key', 'sha256');
      const msg = 'authenticity payload';
      const sig = signer.sign(msg);
      
      expect(sig instanceof Uint8Array || sig instanceof Buffer).toBeTruthy();
      expect(signer.verify(msg, sig)).toBeTruthy();
      expect(signer.verify('tampered-payload', sig)).toBeFalsy();
    });
  });
