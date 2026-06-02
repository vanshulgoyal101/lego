import { describe, it, expect } from '../../../test/test-harness.js';
import { Polynomial } from './index.js';

await describe('math/polynomial', async () => {
  await it('should create polynomial and store coefficients', () => {
    const p = new Polynomial([1, 2, 3]); // 1 + 2x + 3x^2
    expect(p.coefficients[0]).toBe(1);
    expect(p.coefficients[1]).toBe(2);
    expect(p.coefficients[2]).toBe(3);
    expect(p.degree).toBe(2);
  });

  await it('should trim trailing zero coefficients', () => {
    const p = new Polynomial([1, 2, 0, 0]);
    expect(p.degree).toBe(1);
  });

  await it('should evaluate polynomial at a point (Horner)', () => {
    // p(x) = 1 + 2x + x^2, p(3) = 1 + 6 + 9 = 16
    const p = new Polynomial([1, 2, 1]);
    expect(p.evaluate(3)).toBe(16);
    expect(p.evaluate(0)).toBe(1);
    expect(p.evaluate(-1)).toBe(0);
  });

  await it('should add two polynomials', () => {
    const a = new Polynomial([1, 2]);     // 1 + 2x
    const b = new Polynomial([3, 0, 1]); // 3 + x^2
    const result = a.add(b);
    expect(result.coefficients[0]).toBe(4);
    expect(result.coefficients[1]).toBe(2);
    expect(result.coefficients[2]).toBe(1);
  });

  await it('should subtract two polynomials', () => {
    const a = new Polynomial([5, 3, 2]);
    const b = new Polynomial([1, 3]);
    const result = a.sub(b);
    expect(result.coefficients[0]).toBe(4);
    expect(result.coefficients[1]).toBe(0);
    expect(result.coefficients[2]).toBe(2);
  });

  await it('should multiply two polynomials', () => {
    // (1 + x)(1 + x) = 1 + 2x + x^2
    const a = new Polynomial([1, 1]);
    const b = new Polynomial([1, 1]);
    const result = a.mul(b);
    expect(result.coefficients[0]).toBe(1);
    expect(result.coefficients[1]).toBe(2);
    expect(result.coefficients[2]).toBe(1);
  });

  await it('should compute the derivative', () => {
    // d/dx (3 + 2x + x^2) = 2 + 2x
    const p = new Polynomial([3, 2, 1]);
    const dp = p.derivative();
    expect(dp.coefficients[0]).toBe(2);
    expect(dp.coefficients[1]).toBe(2);
    expect(dp.degree).toBe(1);
  });

  await it('should return constant zero derivative for constant polynomial', () => {
    const p = new Polynomial([5]);
    const dp = p.derivative();
    expect(dp.coefficients[0]).toBe(0);
  });

  await it('should convert to string', () => {
    const p = new Polynomial([3, 2, -1]); // 3 + 2x - x^2
    const str = p.toString();
    expect(str.includes('x')).toBe(true);
    expect(str.includes('3')).toBe(true);
  });

  await it('should represent constant polynomial as string', () => {
    const p = new Polynomial([7]);
    expect(p.toString()).toBe('7');
  });

  await it('should throw on empty coefficients', () => {
    expect(() => new Polynomial([])).toThrow('non-empty');
  });
});
