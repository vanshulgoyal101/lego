import { describe, it, expect } from '../../../test/test-harness.js';
import {encrypt as aesEncrypt, decrypt as aesDecrypt} from './index.js';

  await describe('crypto/aes', async () => {
    await it('should encrypt and decrypt messages correctly', async () => {
      const secret = 'aes-shared-key';
      const cipher = await aesEncrypt('hello aes', secret);
      const plain = await aesDecrypt(cipher, secret);
      expect(plain).toBe('hello aes');
    });
  });
