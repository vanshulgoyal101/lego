import { describe, it, expect } from '../../../test/test-harness.js';
import { BigIntFraction } from './index.js';

await describe('math/bigint-fraction', async () => {
  await it('should initialize and simplify fractions correctly', () => {
    const f1 = new BigIntFraction(4n, 8n);
    expect(f1.num).toBe(1n);
    expect(f1.den).toBe(2n);
    expect(f1.toString()).toBe('1/2');

    const f2 = new BigIntFraction(-3, -9);
    expect(f2.toString()).toBe('1/3');

    const f3 = new BigIntFraction(5n, -10n);
    expect(f3.toString()).toBe('-1/2');
  });

  await it('should perform exact arithmetic operations', () => {
    const half = new BigIntFraction(1n, 2n);
    const third = new BigIntFraction(1n, 3n);

    // Addition: 1/2 + 1/3 = 5/6
    const sum = half.add(third);
    expect(sum.toString()).toBe('5/6');

    // Subtraction: 1/2 - 1/3 = 1/6
    const diff = half.subtract(third);
    expect(diff.toString()).toBe('1/6');

    // Multiplication: 1/2 * 1/3 = 1/6
    const prod = half.multiply(third);
    expect(prod.toString()).toBe('1/6');

    // Division: (1/2) / (1/3) = 3/2
    const quot = half.divide(third);
    expect(quot.toString()).toBe('3/2');
  });

  await it('should handle large arbitrary precision inputs correctly', () => {
    const f1 = new BigIntFraction('12345678901234567890', '98765432109876543210');
    // Simplified via GCD of 900000000090n
    expect(f1.num).toBe(13717421n);
    expect(f1.den).toBe(109739369n);
  });

  await it('should compare fractions correctly', () => {
    const f1 = new BigIntFraction(2n, 3n);
    const f2 = new BigIntFraction(3n, 4n);

    expect(f1.compare(f2)).toBe(-1); // 2/3 < 3/4
    expect(f2.compare(f1)).toBe(1);  // 3/4 > 2/3
    expect(f1.equals(new BigIntFraction(4n, 6n))).toBe(true);
  });

  await it('should throw error on division by zero', () => {
    let errorThrown = false;
    try {
      new BigIntFraction(1, 0);
    } catch (e) {
      errorThrown = true;
    }
    expect(errorThrown).toBe(true);
  });
});
