function bitReverse(re, im) {
  const n = re.length;
  let j = 0;
  for (let i = 0; i < n; i++) {
    if (i < j) {
      let temp = re[i];
      re[i] = re[j];
      re[j] = temp;

      temp = im[i];
      im[i] = im[j];
      im[j] = temp;
    }
    let bit = n >> 1;
    while (j & bit) {
      j ^= bit;
      bit >>= 1;
    }
    j ^= bit;
  }
}

/**
 * Perform Radix-2 in-place Cooley-Tukey transformation
 *
 * @param {Float64Array|number[]} re - Array of real components
 * @param {Float64Array|number[]} im - Array of imaginary components
 * @param {boolean} [inverse=false] - True to execute IFFT instead
 */
export function transform(re, im, inverse = false) {
  if (!Array.isArray(re) && !(re instanceof Float64Array)) {
    throw new Error('InvalidInput: Inputs must be array-like numerical lists.');
  }
  if (re.length !== im.length) {
    throw new Error('InvalidInput: Real and imaginary parts must have the same length.');
  }

  const n = re.length;
  if (n <= 1) return;
  if ((n & (n - 1)) !== 0) {
    throw new Error('InvalidInput: Length of arrays must be a power of 2.');
  }

  bitReverse(re, im);

  for (let len = 2; len <= n; len <<= 1) {
    const angle = (2 * Math.PI / len) * (inverse ? 1 : -1);
    const wLenRe = Math.cos(angle);
    const wLenIm = Math.sin(angle);

    for (let i = 0; i < n; i += len) {
      let wRe = 1;
      let wIm = 0;

      for (let j = 0; j < len / 2; j++) {
        const uRe = re[i + j];
        const uIm = im[i + j];

        const targetIdx = i + j + len / 2;
        const tRe = re[targetIdx] * wRe - im[targetIdx] * wIm;
        const tIm = re[targetIdx] * wIm + im[targetIdx] * wRe;

        re[i + j] = uRe + tRe;
        im[i + j] = uIm + tIm;

        re[targetIdx] = uRe - tRe;
        im[targetIdx] = uIm - tIm;

        const nextWRe = wRe * wLenRe - wIm * wLenIm;
        const nextWIm = wRe * wLenIm + wIm * wLenRe;
        wRe = nextWRe;
        wIm = nextWIm;
      }
    }
  }

  if (inverse) {
    for (let i = 0; i < n; i++) {
      re[i] /= n;
      im[i] /= n;
    }
  }
}

/**
 * Forward FFT
 */
export function fft(re, im) {
  transform(re, im, false);
}

/**
 * Inverse FFT
 */
export function ifft(re, im) {
  transform(re, im, true);
}
export default { fft, ifft, transform };
