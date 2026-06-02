import { describe, it, expect } from '../../../test/test-harness.js';
import {LruCache} from './index.js';

  await describe('ds/lru-cache', async () => {
    await it('should evict LRU items when size limit is exceeded', async () => {
      const cache = new LruCache(2);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      expect(cache.get('a')).toBe(undefined);
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBe(3);
    });
  });
