import { describe, it, expect } from '../../../test/test-harness.js';
import {generateTotp, verifyTotp} from './index.js';

  await describe('crypto/totp', async () => {
    await it('should generate and verify codes using Web Crypto API', async () => {
      const secret = 'MZXW6YTBOI'; // Base32 for "foobar"
      const time = 1780394151000;
      const code = await generateTotp(secret, { time });
      expect(code.length).toBe(6);
      
      const isValid = await verifyTotp(code, secret, { time });
      expect(isValid).toBe(true);

      const isInvalid = await verifyTotp('111111', secret, { time });
      expect(isInvalid).toBe(false);
    });
  });
