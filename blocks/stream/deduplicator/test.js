import { describe, it, expect } from '../../../test/test-harness.js';
import { Deduplicator } from './index.js';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

await describe('stream/deduplicator', async () => {
  await it('should filter duplicates based on default selectors', async () => {
    const dedup = new Deduplicator();
    const input = [1, 2, 2, 3, 1, 4];
    
    const output = [];
    for await (const x of dedup.transform(input)) {
      output.push(x);
    }

    expect(output).toEqual([1, 2, 3, 4]);
  });

  await it('should filter objects based on custom keySelector', async () => {
    const dedup = new Deduplicator({
      keySelector: (item) => item.guid
    });

    const input = [
      { guid: 'a', val: 1 },
      { guid: 'b', val: 2 },
      { guid: 'a', val: 3 }, // Duplicate GUID
      { guid: 'c', val: 4 }
    ];

    const output = [];
    for await (const x of dedup.transform(input)) {
      output.push(x);
    }

    expect(output).toEqual([
      { guid: 'a', val: 1 },
      { guid: 'b', val: 2 },
      { guid: 'c', val: 4 }
    ]);
  });

  await it('should evict keys when maxCacheSize is exceeded', async () => {
    const dedup = new Deduplicator({ maxCacheSize: 2 });
    
    expect(dedup.isDuplicate('a')).toBe(false);
    expect(dedup.isDuplicate('b')).toBe(false);
    // Cache has 'a', 'b'
    
    expect(dedup.isDuplicate('c')).toBe(false); // Cache gets 'c', evicts 'a'
    
    expect(dedup.isDuplicate('a')).toBe(false); // 'a' is new again because it was evicted
  });

  await it('should expire entries based on TTL', async () => {
    const dedup = new Deduplicator({ ttlMs: 50 });
    
    expect(dedup.isDuplicate('x')).toBe(false);
    expect(dedup.isDuplicate('x')).toBe(true); // Duplicate

    await sleep(80);

    expect(dedup.isDuplicate('x')).toBe(false); // Expired, should not be duplicate
  });
});
