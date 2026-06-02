import { describe, it, expect } from '../../../test/test-harness.js';
import { kmpSearch, boyerMoore, rabinKarp } from './index.js';

await describe('text/string-search', async () => {
  const testCases = [
    { text: 'ababcabcab', pattern: 'abc', expected: [2, 5] },
    { text: 'aababab',   pattern: 'ab',  expected: [1, 3, 5] },
    { text: 'aaaa',      pattern: 'aa',  expected: [0, 1, 2] },
    { text: 'hello',     pattern: 'xyz', expected: [] },
    { text: 'abcd',      pattern: 'abcd',expected: [0] },
  ];

  // ─── KMP ────────────────────────────────────────────────────────────────────
  await it('kmpSearch: finds all occurrences', () => {
    for (const { text, pattern, expected } of testCases) {
      expect(kmpSearch(text, pattern)).toEqual(expected);
    }
  });

  await it('kmpSearch: empty pattern returns empty array', () => {
    expect(kmpSearch('hello', '')).toEqual([]);
  });

  await it('kmpSearch: pattern longer than text returns empty', () => {
    expect(kmpSearch('hi', 'hello')).toEqual([]);
  });

  await it('kmpSearch: single character pattern', () => {
    expect(kmpSearch('aabbcc', 'b')).toEqual([2, 3]);
  });

  // ─── Boyer-Moore ─────────────────────────────────────────────────────────────
  await it('boyerMoore: finds all occurrences', () => {
    for (const { text, pattern, expected } of testCases) {
      expect(boyerMoore(text, pattern)).toEqual(expected);
    }
  });

  await it('boyerMoore: empty pattern returns empty array', () => {
    expect(boyerMoore('hello', '')).toEqual([]);
  });

  await it('boyerMoore: pattern longer than text returns empty', () => {
    expect(boyerMoore('hi', 'hello')).toEqual([]);
  });

  await it('boyerMoore: ABAAABCD example', () => {
    expect(boyerMoore('ABAAABCD', 'ABC')).toEqual([4]);
  });

  // ─── Rabin-Karp ──────────────────────────────────────────────────────────────
  await it('rabinKarp: finds all occurrences', () => {
    for (const { text, pattern, expected } of testCases) {
      expect(rabinKarp(text, pattern)).toEqual(expected);
    }
  });

  await it('rabinKarp: empty pattern returns empty array', () => {
    expect(rabinKarp('hello', '')).toEqual([]);
  });

  await it('rabinKarp: pattern longer than text returns empty', () => {
    expect(rabinKarp('hi', 'hello')).toEqual([]);
  });

  await it('rabinKarp: all three agree on a longer text', () => {
    const text = 'the cat sat on the mat with the bat';
    const pattern = 'the';
    const kmp = kmpSearch(text, pattern);
    const bm  = boyerMoore(text, pattern);
    const rk  = rabinKarp(text, pattern);
    expect(kmp).toEqual(bm);
    expect(bm).toEqual(rk);
    expect(kmp.length).toBe(3);
  });
});
