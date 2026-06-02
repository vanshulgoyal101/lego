import { describe, it, expect } from '../../../test/test-harness.js';
import { PageCache } from './index.js';

await describe('db/page-cache', async () => {
  await it('should read/write block pages, cache reads, and trigger dirty page evictions', async () => {
    // Disk simulation adapter
    const disk = new Map();
    const cache = new PageCache(2, 4, disk); // Capacity 2, Page size 4 bytes

    // 1. Write page 1
    const p1 = new Uint8Array([1, 2, 3, 4]);
    await cache.writePage(1, p1);
    expect(cache.cache.has(1)).toBe(true);

    // 2. Write page 2
    const p2 = new Uint8Array([5, 6, 7, 8]);
    await cache.writePage(2, p2);
    expect(cache.cache.has(2)).toBe(true);

    // Disk should not have them yet (no flush, no eviction)
    expect(disk.has(1)).toBe(false);

    // 3. Write page 3: triggers eviction of LRU page 1 (since we wrote 1 then 2)
    const p3 = new Uint8Array([9, 10, 11, 12]);
    await cache.writePage(3, p3);

    expect(cache.cache.has(1)).toBe(false); // Evicted!
    expect(disk.has(1)).toBe(true); // Flushed to disk since it was dirty!
    expect(disk.get(1)).toEqual(p1);

    // 4. Read page 1 back (should load from disk and evict page 2)
    const loadedP1 = await cache.readPage(1);
    expect(loadedP1).toEqual(p1);
    expect(cache.cache.has(2)).toBe(false); // Page 2 is now evicted!
    expect(disk.has(2)).toBe(true); // Flushed to disk since it was dirty!
  });
});
