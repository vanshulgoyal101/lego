import { describe, it, expect } from '../../../test/test-harness.js';
import {RateLimiter} from './index.js';

  await describe('validation/rate-limiter', async () => {
    await it('should throttle requests over window limits', async () => {
      const rl = new RateLimiter(2, 50);
      expect(rl.check('user1')).toBe(true);
      expect(rl.check('user1')).toBe(true);
      expect(rl.check('user1')).toBe(false); // Throttled
    });
  });
