import { describe, it, expect } from '../../../test/test-harness.js';
import { boyerMooreSearch } from './index.js';

await describe('algo/boyer-moore', async () => {
  await it('should find all occurrences of pattern in text using Boyer-Moore bad character shift table', () => {
    expect(boyerMooreSearch('ABAAABCD', 'ABC')).toEqual([4]);
    expect(boyerMooreSearch('aaaaa', 'aa')).toEqual([0, 1, 2, 3]);
    expect(boyerMooreSearch('banana', 'ana')).toEqual([1, 3]);
    expect(boyerMooreSearch('hello world', 'xyz')).toEqual([]);
    expect(boyerMooreSearch('test', '')).toEqual([]);
  });
});
