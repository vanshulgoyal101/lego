import { describe, it, expect } from '../../../test/test-harness.js';
import { lcs, lcsSimilarity } from './index.js';

await describe('algo/lcs', async () => {
  await it('should compute LCS of two strings', () => {
    const result = lcs('ABCBDAB', 'BDCAB');
    expect(result.length).toBe(4);
  });

  await it('should return correct sequence for simple strings', () => {
    const result = lcs('AGCAT', 'GAC');
    expect(result.length).toBe(2);
    // One valid LCS is 'AC' or 'GA' — just check length and it's a subsequence of both
    for (const ch of result.sequence) {
      expect('AGCAT'.includes(ch)).toBe(true);
      expect('GAC'.includes(ch)).toBe(true);
    }
  });

  await it('should return empty when no common elements', () => {
    const result = lcs('abc', 'xyz');
    expect(result.length).toBe(0);
    expect(result.sequence).toBe('');
  });

  await it('should return one of the strings when inputs are identical', () => {
    const result = lcs('hello', 'hello');
    expect(result.length).toBe(5);
    expect(result.sequence).toBe('hello');
  });

  await it('should work with arrays', () => {
    const result = lcs([1, 3, 4, 5, 6], [3, 5, 6]);
    expect(result.length).toBe(3);
    expect(result.sequence).toEqual([3, 5, 6]);
  });

  await it('should return similarity of 1 for identical strings', () => {
    expect(lcsSimilarity('abc', 'abc')).toBe(1);
  });

  await it('should return similarity of 0 for disjoint strings', () => {
    expect(lcsSimilarity('abc', 'xyz')).toBe(0);
  });

  await it('should return similarity between 0 and 1 for partial match', () => {
    const sim = lcsSimilarity('kitten', 'sitting');
    expect(sim).toBeGreaterThan(0);
    expect(sim).toBeLessThan(1);
  });

  await it('should handle empty strings in similarity', () => {
    expect(lcsSimilarity('', '')).toBe(1);
    expect(lcsSimilarity('abc', '')).toBe(0);
  });
});
