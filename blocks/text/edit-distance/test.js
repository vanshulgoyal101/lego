import { describe, it, expect } from '../../../test/test-harness.js';
import { levenshtein, hamming, jaro, jaroWinkler, damerauLevenshtein } from './index.js';

await describe('text/edit-distance', async () => {
  // ─── Levenshtein ────────────────────────────────────────────────────────────
  await it('levenshtein: identical strings → 0', () => {
    expect(levenshtein('abc', 'abc')).toBe(0);
    expect(levenshtein('', '')).toBe(0);
  });

  await it('levenshtein: empty vs non-empty → length', () => {
    expect(levenshtein('', 'abc')).toBe(3);
    expect(levenshtein('abc', '')).toBe(3);
  });

  await it('levenshtein: classic kitten→sitting = 3', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3);
  });

  await it('levenshtein: one substitution', () => {
    expect(levenshtein('abc', 'axc')).toBe(1);
  });

  // ─── Hamming ────────────────────────────────────────────────────────────────
  await it('hamming: identical strings → 0', () => {
    expect(hamming('abc', 'abc')).toBe(0);
  });

  await it('hamming: counts differing positions', () => {
    expect(hamming('karolin', 'kathrin')).toBe(3);
    expect(hamming('1011101', '1001001')).toBe(2);
  });

  await it('hamming: throws on different lengths', () => {
    expect(() => hamming('abc', 'abcd')).toThrow();
  });

  // ─── Jaro ───────────────────────────────────────────────────────────────────
  await it('jaro: identical strings → 1', () => {
    expect(jaro('abc', 'abc')).toBe(1);
  });

  await it('jaro: empty strings → 0', () => {
    expect(jaro('', 'abc')).toBe(0);
    expect(jaro('abc', '')).toBe(0);
  });

  await it('jaro: MARTHA vs MARHTA ≈ 0.944', () => {
    expect(jaro('MARTHA', 'MARHTA')).toBeCloseTo(0.9444, 3);
  });

  await it('jaro: completely different → low similarity', () => {
    expect(jaro('abc', 'xyz')).toBeLessThan(0.5);
  });

  // ─── Jaro-Winkler ───────────────────────────────────────────────────────────
  await it('jaroWinkler: identical strings → 1', () => {
    expect(jaroWinkler('abc', 'abc')).toBe(1);
  });

  await it('jaroWinkler: >= jaro for shared prefix strings', () => {
    const a = 'MARTHA', b = 'MARHTA';
    expect(jaroWinkler(a, b)).toBeGreaterThan(jaro(a, b));
  });

  await it('jaroWinkler: in [0, 1] range', () => {
    const score = jaroWinkler('hello', 'world');
    expect(score >= 0 && score <= 1).toBe(true);
  });

  // ─── Damerau-Levenshtein ────────────────────────────────────────────────────
  await it('damerauLevenshtein: identical → 0', () => {
    expect(damerauLevenshtein('abc', 'abc')).toBe(0);
  });

  await it('damerauLevenshtein: transposition counts as 1', () => {
    // "ab" → "ba" is 1 transposition, but 2 edits in plain Levenshtein
    expect(damerauLevenshtein('ab', 'ba')).toBe(1);
    expect(levenshtein('ab', 'ba')).toBe(2);
  });

  await it('damerauLevenshtein: ca → abc = 3 (restricted DL)', () => {
    // Restricted DL: 'ca' -> 'abc' requires 3 operations (insert 'a', insert 'b', or sub+insert)
    expect(damerauLevenshtein('ca', 'abc')).toBe(3);
  });
});
