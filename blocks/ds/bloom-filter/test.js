import { describe, it, expect } from '../../../test/test-harness.js';
import {BloomFilter} from './index.js';

  await describe('ds/bloom-filter', async () => {
    await it('should estimate membership safely', async () => {
      const filter = new BloomFilter(100);
      filter.add('key');
      expect(filter.test('key')).toBe(true);
      expect(filter.test('non-key')).toBe(false);
    });
  });
