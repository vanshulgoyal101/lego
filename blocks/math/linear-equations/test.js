import { describe, it, expect } from '../../../test/test-harness.js';
import { solve } from './index.js';

await describe('math/linear-equations', async () => {
  await it('should correctly solve unique linear equations system values', () => {
    // System representing:
    // 2x + y - z = 8
    // -3x - y + 2z = -11
    // -2x + y + 2z = -3
    const A = [
      [2, 1, -1],
      [-3, -1, 2],
      [-2, 1, 2]
    ];
    const B = [8, -11, -3];

    const x = solve(A, B); // Expected: [2, 3, -1]

    expect(Math.abs(x[0] - 2.0) < 1e-6).toBe(true);
    expect(Math.abs(x[1] - 3.0) < 1e-6).toBe(true);
    expect(Math.abs(x[2] - (-1.0)) < 1e-6).toBe(true);
  });

  await it('should throw error on singular matrices', () => {
    const A = [
      [1, 2],
      [2, 4]
    ];
    const B = [3, 6];

    let errorOccurred = false;
    try {
      solve(A, B);
    } catch (err) {
      errorOccurred = true;
      expect(err.message.includes('SingularMatrix')).toBe(true);
    }
    expect(errorOccurred).toBe(true);
  });
});
