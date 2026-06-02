import { describe, it, expect } from '../../../test/test-harness.js';
import {memoize} from './index.js';

  await describe('utils/memoize', async () => {
    await it('should retrieve cached outputs for same parameters', async () => {
      let counter = 0;
      const fn = memoize((x) => {
        counter++;
        return x * 2;
      });
      expect(fn(5)).toBe(10);
      expect(fn(5)).toBe(10);
      expect(counter).toBe(1); // Second call should be from cache
    });
  });
