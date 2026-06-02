import { describe, it, expect } from '../../../test/test-harness.js';
import { rabinKarpSearch } from './index.js';

await describe('algo/rabin-karp', async () => {
  await it('should locate all occurrence indexes of pattern in text using rolling hashes', () => {
    expect(rabinKarpSearch('GEEKS FOR GEEKS', 'GEEK')).toEqual([0, 10]);
    expect(rabinKarpSearch('aaaaa', 'aa')).toEqual([0, 1, 2, 3]);
    expect(rabinKarpSearch('banana', 'ana')).toEqual([1, 3]);
    expect(rabinKarpSearch('hello world', 'xyz')).toEqual([]);
    expect(rabinKarpSearch('test', '')).toEqual([]);
  });
});
