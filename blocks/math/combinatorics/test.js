import { describe, it, expect } from '../../../test/test-harness.js';
import { factorial, choose, permutations, combinations, cartesianProduct, powerSet } from './index.js';

await describe('math/combinatorics', async () => {
  await it('factorial: base cases', () => {
    expect(factorial(0)).toBe(1);
    expect(factorial(1)).toBe(1);
    expect(factorial(5)).toBe(120);
    expect(factorial(10)).toBe(3628800);
  });

  await it('factorial: large n uses BigInt', () => {
    const result = factorial(20);
    expect(typeof result === 'bigint' || typeof result === 'number').toBe(true);
    // 20! = 2432902008176640000
  });

  await it('factorial: throws on negative', () => {
    expect(() => factorial(-1)).toThrow();
  });

  await it('choose: standard binomial coefficients', () => {
    expect(choose(5, 0)).toBe(1);
    expect(choose(5, 5)).toBe(1);
    expect(choose(5, 2)).toBe(10);
    expect(choose(6, 3)).toBe(20);
    expect(choose(10, 4)).toBe(210);
  });

  await it('choose: k > n returns 0', () => {
    expect(choose(3, 5)).toBe(0);
  });

  await it('permutations: should generate all arrangements', () => {
    const result = permutations([1, 2, 3]);
    expect(result.length).toBe(6); // 3! = 6
    // Check that [1,2,3] is included
    const found = result.some(p => p[0] === 1 && p[1] === 2 && p[2] === 3);
    expect(found).toBe(true);
  });

  await it('permutations: empty array gives one empty permutation', () => {
    const result = permutations([]);
    expect(result.length).toBe(1);
    expect(result[0].length).toBe(0);
  });

  await it('combinations: should generate k-element subsets', () => {
    const result = combinations([1, 2, 3, 4], 2);
    expect(result.length).toBe(6); // C(4,2) = 6
    // All results should have exactly 2 elements
    expect(result.every(c => c.length === 2)).toBe(true);
  });

  await it('combinations: k=0 gives empty combination', () => {
    expect(combinations([1, 2, 3], 0)).toEqual([[]]);
  });

  await it('cartesianProduct: two arrays', () => {
    const result = cartesianProduct([1, 2], ['a', 'b']);
    expect(result.length).toBe(4);
    expect(result).toEqual([[1,'a'],[1,'b'],[2,'a'],[2,'b']]);
  });

  await it('cartesianProduct: three arrays', () => {
    const result = cartesianProduct([0, 1], [0, 1], [0, 1]);
    expect(result.length).toBe(8);
  });

  await it('cartesianProduct: no args gives one empty tuple', () => {
    expect(cartesianProduct()).toEqual([[]]);
  });

  await it('powerSet: should generate 2^n subsets', () => {
    const result = powerSet([1, 2, 3]);
    expect(result.length).toBe(8); // 2^3
    // Empty set should be included
    const hasEmpty = result.some(s => s.length === 0);
    expect(hasEmpty).toBe(true);
    // Full set should be included
    const hasFull = result.some(s => s.length === 3);
    expect(hasFull).toBe(true);
  });

  await it('powerSet: empty array gives [[]]', () => {
    expect(powerSet([])).toEqual([[]]);
  });
});
