import { describe, it, expect } from '../../../test/test-harness.js';
import { LSMTree } from './index.js';

await describe('db/lsm-tree', async () => {
  await it('should read/write values, trigger flush, delete keys via tombstones, and perform compaction', () => {
    const lsm = new LSMTree({ memTableThreshold: 3 });

    // 1. Basic put and get from MemTable
    lsm.put('a', 'apple');
    lsm.put('b', 'banana');
    expect(lsm.get('a')).toBe('apple');
    expect(lsm.get('b')).toBe('banana');
    expect(lsm.ssTables.length).toBe(0);

    // 2. Trigger flush (3rd put triggers flush of size 3 Map)
    lsm.put('c', 'cherry'); // memTable has 3 keys, flushes to 1 SSTable
    expect(lsm.ssTables.length).toBe(1);
    expect(lsm.memTable.size).toBe(0);
    expect(lsm.get('a')).toBe('apple');
    expect(lsm.get('b')).toBe('banana');
    expect(lsm.get('c')).toBe('cherry');

    // 3. Delete key (tombstone)
    lsm.delete('b');
    expect(lsm.get('b')).toBe(null); // Marked deleted

    // 4. Overwrite key in new generation
    lsm.put('a', 'apricot');
    lsm.put('d', 'date'); // triggers flush (tombstone, apricot, date)
    expect(lsm.ssTables.length).toBe(2);
    expect(lsm.get('a')).toBe('apricot'); // returns new value
    expect(lsm.get('b')).toBe(null);

    // 5. Compaction
    lsm.compact();
    expect(lsm.ssTables.length).toBe(1);
    expect(lsm.get('a')).toBe('apricot');
    expect(lsm.get('b')).toBe(undefined); // tombstone is purged
    expect(lsm.get('c')).toBe('cherry');
    expect(lsm.get('d')).toBe('date');
  });
});
