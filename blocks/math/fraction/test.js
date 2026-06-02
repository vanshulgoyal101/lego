import { describe, it, expect } from '../../../test/test-harness.js';
import { Fraction } from './index.js';

await describe('math/fraction', async () => {
  await it('should create a fraction and return correct numerator/denominator', () => {
    const f = new Fraction(3, 4);
    expect(f.numerator).toBe(3);
    expect(f.denominator).toBe(4);
  });

  await it('should canonicalize negative denominators', () => {
    const f = new Fraction(1, -2);
    expect(f.numerator).toBe(-1);
    expect(f.denominator).toBe(2);
  });

  await it('should simplify fractions', () => {
    const f = new Fraction(6, 8).simplify();
    expect(f.numerator).toBe(3);
    expect(f.denominator).toBe(4);
  });

  await it('should add two fractions', () => {
    const a = new Fraction(1, 2);
    const b = new Fraction(1, 3);
    expect(a.add(b).toString()).toBe('5/6');
  });

  await it('should subtract two fractions', () => {
    const a = new Fraction(3, 4);
    const b = new Fraction(1, 4);
    expect(a.sub(b).toString()).toBe('1/2');
  });

  await it('should multiply two fractions', () => {
    const a = new Fraction(2, 3);
    const b = new Fraction(3, 4);
    expect(a.mul(b).toString()).toBe('1/2');
  });

  await it('should divide two fractions', () => {
    const a = new Fraction(1, 2);
    const b = new Fraction(1, 4);
    expect(a.div(b).toString()).toBe('2');
  });

  await it('should convert to decimal', () => {
    expect(new Fraction(1, 4).toDecimal()).toBe(0.25);
  });

  await it('should display whole numbers without denominator', () => {
    expect(new Fraction(8, 4).toString()).toBe('2');
  });

  await it('should test equality', () => {
    expect(new Fraction(2, 4).equals(new Fraction(1, 2))).toBe(true);
    expect(new Fraction(1, 3).equals(new Fraction(2, 6))).toBe(true);
  });

  await it('should compute abs and neg', () => {
    expect(new Fraction(-3, 4).abs().toString()).toBe('3/4');
    expect(new Fraction(3, 4).neg().toString()).toBe('-3/4');
  });

  await it('should compare fractions', () => {
    const a = new Fraction(1, 2);
    const b = new Fraction(1, 3);
    expect(a.compare(b) > 0).toBe(true);
  });

  await it('should throw on zero denominator', () => {
    expect(() => new Fraction(1, 0)).toThrow('zero');
  });

  await it('should throw on non-integer inputs', () => {
    expect(() => new Fraction(1.5, 2)).toThrow('integers');
  });
});
