import { describe, it, expect } from '../../../test/test-harness.js';
import { trapezoidal, simpson } from './index.js';

await describe('math/numerical-integration', async () => {
  await it('should accurately integrate f(x) = x^2 from 0 to 1', () => {
    const f = x => x * x;
    const resTrap = trapezoidal(f, 0, 1, 1000);
    const resSimp = simpson(f, 0, 1, 100);

    // Analytical result: 1/3
    expect(Math.abs(resTrap - 0.333333) < 1e-5).toBe(true);
    expect(Math.abs(resSimp - 0.333333) < 1e-6).toBe(true);
  });

  await it('should accurately integrate f(x) = sin(x) from 0 to PI', () => {
    const f = x => Math.sin(x);
    const resSimp = simpson(f, 0, Math.PI, 100);

    // Analytical result: 2
    expect(Math.abs(resSimp - 2.0) < 1e-5).toBe(true);
  });
});
