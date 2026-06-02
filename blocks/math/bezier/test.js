import { describe, it, expect } from '../../../test/test-harness.js';
import { quadratic, cubic, deCasteljau, generateCurve } from './index.js';

await describe('math/bezier', async () => {
  await it('should correctly compute quadratic Bezier coordinates', () => {
    const p0 = [0, 0];
    const p1 = [1, 2];
    const p2 = [2, 0];

    // Midpoint t=0.5: B(0.5) should be [1.0, 1.0]
    const mid = quadratic(p0, p1, p2, 0.5);
    expect(Math.abs(mid[0] - 1.0) < 1e-6).toBe(true);
    expect(Math.abs(mid[1] - 1.0) < 1e-6).toBe(true);
  });

  await it('should correctly compute cubic Bezier coordinates', () => {
    const p0 = [0, 0];
    const p1 = [1, 3];
    const p2 = [2, 3];
    const p3 = [3, 0];

    // Midpoint t=0.5: B(0.5) should be [1.5, 2.25]
    const mid = cubic(p0, p1, p2, p3, 0.5);
    expect(Math.abs(mid[0] - 1.5) < 1e-6).toBe(true);
    expect(Math.abs(mid[1] - 2.25) < 1e-6).toBe(true);
  });

  await it('should support arbitrary-degree curves using De Casteljau algorithm', () => {
    const controlPoints = [
      [0, 0],
      [1, 2],
      [2, 0]
    ];

    const genMid = deCasteljau(controlPoints, 0.5);
    const quadMid = quadratic(controlPoints[0], controlPoints[1], controlPoints[2], 0.5);

    expect(Math.abs(genMid[0] - quadMid[0]) < 1e-6).toBe(true);
    expect(Math.abs(genMid[1] - quadMid[1]) < 1e-6).toBe(true);
  });
});
