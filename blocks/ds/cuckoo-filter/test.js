import { describe, it, expect } from '../../../test/test-harness.js';
import { CuckooFilter } from './index.js';

await describe('ds/cuckoo-filter', async () => {
  await it('should correctly insert, test and delete elements', () => {
    const filter = new CuckooFilter(16, 2); // Small filter for test

    filter.add('apple');
    filter.add('banana');

    expect(filter.test('apple')).toBe(true);
    expect(filter.test('banana')).toBe(true);
    expect(filter.test('grape')).toBe(false);

    // Delete item
    expect(filter.delete('apple')).toBe(true);
    expect(filter.test('apple')).toBe(false); // Deleted
    expect(filter.test('banana')).toBe(true); // Retained
  });
});
