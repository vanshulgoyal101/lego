import { describe, it, expect } from '../../../test/test-harness.js';
import {validateLuhn} from './index.js';

  await describe('algo/luhn', async () => {
    await it('should validate valid card codes and block invalid ones', async () => {
      expect(validateLuhn('79927398713')).toBe(true);
      expect(validateLuhn('79927398714')).toBe(false);
    });
  });
