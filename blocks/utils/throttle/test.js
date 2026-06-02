import { describe, it, expect } from '../../../test/test-harness.js';
import {throttle} from './index.js';

  await describe('utils/throttle', async () => {
    await it('should execute action at most once in a timeframe', async () => {
      let counter = 0;
      const fn = throttle(() => { counter++; }, 25);
      fn();
      fn();
      expect(counter).toBe(1);
      await new Promise(resolve => setTimeout(resolve, 30));
      fn();
      expect(counter).toBe(2);
    });
  });
