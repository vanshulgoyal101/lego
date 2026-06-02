import { describe, it, expect } from '../../../test/test-harness.js';
import { validateJwtHeaders } from './index.js';
import { sign } from '../../crypto/jwt-helper/index.js';

  await describe('validation/jwt-validator', async () => {
    await it('should validate authorization Bearer headers', async () => {
      const token = await sign({ user: 'foo' }, 'secretKey');
      const payload = await validateJwtHeaders(`Bearer ${token}`, 'secretKey');
      expect(payload.user).toBe('foo');
    });
  });
