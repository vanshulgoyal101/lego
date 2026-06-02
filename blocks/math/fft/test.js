import { describe, it, expect } from '../../../test/test-harness.js';
import { fft, ifft } from './index.js';

await describe('math/fft', async () => {
  await it('should perform forward and inverse transforms and reconstruct the original signal', () => {
    // 8-point signal (power of 2)
    const originalRe = [1.0, 2.0, 3.0, 4.0, 1.0, 2.0, 3.0, 4.0];
    const originalIm = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];

    const re = [...originalRe];
    const im = [...originalIm];

    // Forward transform
    fft(re, im);

    // Re should not be equal to original now
    let isDifferent = false;
    for (let i = 0; i < re.length; i++) {
      if (Math.abs(re[i] - originalRe[i]) > 1e-3) {
        isDifferent = true;
        break;
      }
    }
    expect(isDifferent).toBe(true);

    // Inverse transform
    ifft(re, im);

    // Reconstructed should be identical to original
    for (let i = 0; i < re.length; i++) {
      expect(Math.abs(re[i] - originalRe[i]) < 1e-6).toBe(true);
      expect(Math.abs(im[i] - originalIm[i]) < 1e-6).toBe(true);
    }
  });
});
