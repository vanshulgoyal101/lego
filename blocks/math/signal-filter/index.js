/**
 * Zero-dependency digital signal processing filter library.
 * Provides IIR (Infinite Impulse Response) filters (Butterworth, Bandpass, Bandstop),
 * Moving Average, and Exponential Moving Average (EMA) filters.
 */

export class IIRFilter {
  /**
   * @param {number[]} b - Feedforward coefficients
   * @param {number[]} a - Feedback coefficients (a[0] should be 1, or coefficients must be pre-normalized)
   */
  constructor(b, a) {
    this.b = b;
    this.a = a;
    this.reset();
  }

  /**
   * Resets the filter's internal state memory.
   */
  reset() {
    this.x = new Array(this.b.length).fill(0);
    this.y = new Array(this.a.length).fill(0);
  }

  /**
   * Processes a single input sample and returns the filtered output sample.
   * @param {number} val - Input sample
   * @returns {number} Filtered sample
   */
  filter(val) {
    // Shift input history
    for (let i = this.b.length - 1; i > 0; i--) {
      this.x[i] = this.x[i - 1];
    }
    this.x[0] = val;

    // Shift output history
    for (let i = this.a.length - 1; i > 0; i--) {
      this.y[i] = this.y[i - 1];
    }

    let out = 0;
    for (let i = 0; i < this.b.length; i++) {
      out += this.b[i] * this.x[i];
    }
    for (let i = 1; i < this.a.length; i++) {
      out -= this.a[i] * this.y[i];
    }
    out /= this.a[0];
    this.y[0] = out;
    return out;
  }

  /**
   * Filters an entire array of samples.
   * @param {number[]} arr - Input samples
   * @returns {number[]} Filtered samples
   */
  filterArray(arr) {
    return arr.map(v => this.filter(v));
  }
}

/**
 * Creates a 2nd order Lowpass Butterworth filter.
 * @param {number} cutoff - Cutoff frequency (Hz)
 * @param {number} sampleRate - Sampling rate (Hz)
 * @returns {IIRFilter}
 */
export function createLowpass(cutoff, sampleRate) {
  if (cutoff <= 0 || cutoff >= sampleRate / 2) {
    throw new Error("Cutoff frequency must be between 0 and sampleRate / 2");
  }
  const omega = Math.tan(Math.PI * cutoff / sampleRate);
  const omegaSq = omega * omega;
  const sqrt2 = Math.sqrt(2);
  const d = 1 + sqrt2 * omega + omegaSq;

  const b0 = omegaSq / d;
  const b1 = 2 * omegaSq / d;
  const b2 = omegaSq / d;
  const a0 = 1;
  const a1 = 2 * (omegaSq - 1) / d;
  const a2 = (1 - sqrt2 * omega + omegaSq) / d;

  return new IIRFilter([b0, b1, b2], [a0, a1, a2]);
}

/**
 * Creates a 2nd order Highpass Butterworth filter.
 * @param {number} cutoff - Cutoff frequency (Hz)
 * @param {number} sampleRate - Sampling rate (Hz)
 * @returns {IIRFilter}
 */
export function createHighpass(cutoff, sampleRate) {
  if (cutoff <= 0 || cutoff >= sampleRate / 2) {
    throw new Error("Cutoff frequency must be between 0 and sampleRate / 2");
  }
  const omega = Math.tan(Math.PI * cutoff / sampleRate);
  const omegaSq = omega * omega;
  const sqrt2 = Math.sqrt(2);
  const d = 1 + sqrt2 * omega + omegaSq;

  const b0 = 1 / d;
  const b1 = -2 / d;
  const b2 = 1 / d;
  const a0 = 1;
  const a1 = 2 * (omegaSq - 1) / d;
  const a2 = (1 - sqrt2 * omega + omegaSq) / d;

  return new IIRFilter([b0, b1, b2], [a0, a1, a2]);
}

/**
 * Creates a 2nd order Bandpass filter using Biquad design.
 * @param {number} lowCutoff - Lower cutoff frequency (Hz)
 * @param {number} highCutoff - Upper cutoff frequency (Hz)
 * @param {number} sampleRate - Sampling rate (Hz)
 * @returns {IIRFilter}
 */
export function createBandpass(lowCutoff, highCutoff, sampleRate) {
  if (lowCutoff <= 0 || highCutoff >= sampleRate / 2 || lowCutoff >= highCutoff) {
    throw new Error("Invalid cutoff frequencies");
  }
  const centerFreq = Math.sqrt(lowCutoff * highCutoff);
  const bandwidth = highCutoff - lowCutoff;
  const omega0 = 2 * Math.PI * centerFreq / sampleRate;
  const q = centerFreq / bandwidth;
  const alpha = Math.sin(omega0) / (2 * q);

  const b0 = alpha;
  const b1 = 0;
  const b2 = -alpha;
  const a0 = 1 + alpha;
  const a1 = -2 * Math.cos(omega0);
  const a2 = 1 - alpha;

  // Normalize
  return new IIRFilter(
    [b0 / a0, b1 / a0, b2 / a0],
    [1, a1 / a0, a2 / a0]
  );
}

/**
 * Creates a 2nd order Bandstop (Notch) filter using Biquad design.
 * @param {number} lowCutoff - Lower cutoff frequency (Hz)
 * @param {number} highCutoff - Upper cutoff frequency (Hz)
 * @param {number} sampleRate - Sampling rate (Hz)
 * @returns {IIRFilter}
 */
export function createBandstop(lowCutoff, highCutoff, sampleRate) {
  if (lowCutoff <= 0 || highCutoff >= sampleRate / 2 || lowCutoff >= highCutoff) {
    throw new Error("Invalid cutoff frequencies");
  }
  const centerFreq = Math.sqrt(lowCutoff * highCutoff);
  const bandwidth = highCutoff - lowCutoff;
  const omega0 = 2 * Math.PI * centerFreq / sampleRate;
  const q = centerFreq / bandwidth;
  const alpha = Math.sin(omega0) / (2 * q);

  const b0 = 1;
  const b1 = -2 * Math.cos(omega0);
  const b2 = 1;
  const a0 = 1 + alpha;
  const a1 = -2 * Math.cos(omega0);
  const a2 = 1 - alpha;

  // Normalize
  return new IIRFilter(
    [b0 / a0, b1 / a0, b2 / a0],
    [1, a1 / a0, a2 / a0]
  );
}

export class MovingAverageFilter {
  /**
   * @param {number} windowSize - Size of the moving average window
   */
  constructor(windowSize) {
    if (windowSize <= 0 || !Number.isInteger(windowSize)) {
      throw new Error("Window size must be a positive integer");
    }
    this.windowSize = windowSize;
    this.reset();
  }

  reset() {
    this.history = [];
    this.sum = 0;
  }

  /**
   * @param {number} val - Input sample
   * @returns {number} Filtered sample
   */
  filter(val) {
    this.history.push(val);
    this.sum += val;
    if (this.history.length > this.windowSize) {
      const removed = this.history.shift();
      this.sum -= removed;
    }
    return this.sum / this.history.length;
  }

  /**
   * @param {number[]} arr - Input samples
   * @returns {number[]} Filtered samples
   */
  filterArray(arr) {
    return arr.map(v => this.filter(v));
  }
}

export class EMAFilter {
  /**
   * @param {number} alpha - Smoothing factor (0 < alpha <= 1)
   */
  constructor(alpha) {
    if (alpha <= 0 || alpha > 1) {
      throw new Error("Alpha must be between 0 (exclusive) and 1 (inclusive)");
    }
    this.alpha = alpha;
    this.reset();
  }

  reset() {
    this.y = null;
  }

  /**
   * @param {number} val - Input sample
   * @returns {number} Filtered sample
   */
  filter(val) {
    if (this.y === null) {
      this.y = val;
    } else {
      this.y = this.alpha * val + (1 - this.alpha) * this.y;
    }
    return this.y;
  }

  /**
   * @param {number[]} arr - Input samples
   * @returns {number[]} Filtered samples
   */
  filterArray(arr) {
    return arr.map(v => this.filter(v));
  }
}

export default {
  IIRFilter,
  createLowpass,
  createHighpass,
  createBandpass,
  createBandstop,
  MovingAverageFilter,
  EMAFilter
};

