import { describe, it, expect } from '../../../test/test-harness.js';
import {PasswordStrength} from './index.js';

  await describe('validation/password-strength', async () => {
    await it('should analyze passwords and calculate entropy correctly', () => {
      const weak = PasswordStrength.analyze('abc');
      expect(weak.strength).toBe('weak');
      expect(weak.valid).toBeFalsy();

      const strong = PasswordStrength.analyze('P@ssw0rdStrength');
      expect(strong.valid).toBeTruthy();
      expect(strong.entropy > 60).toBeTruthy();
    });
  });
