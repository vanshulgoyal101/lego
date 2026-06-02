import { describe, it, expect } from '../../../test/test-harness.js';
import { kmpSearch } from './index.js';

await describe('algo/kmp-search', async () => {
  await it('should find all matching index coordinates of a pattern in text', () => {
    expect(kmpSearch('ABABDABACDABABCABAB', 'ABABCABAB')).toEqual([10]);
    expect(kmpSearch('aaaaa', 'aa')).toEqual([0, 1, 2, 3]);
    expect(kmpSearch('banana', 'ana')).toEqual([1, 3]);
    expect(kmpSearch('hello world', 'abc')).toEqual([]);
    expect(kmpSearch('test', '')).toEqual([]);
  });
});
