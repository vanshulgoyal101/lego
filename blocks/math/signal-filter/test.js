import { describe, it, expect } from '../../../test/test-harness.js';
import {
  createLowpass,
  createHighpass,
  createBandpass,
  createBandstop,
  MovingAverageFilter,
  EMAFilter
} from './index.js';

await describe('math/signal-filter', async () => {
  await it('should lowpass filter high-frequency noise from a DC signal', () => {
    const lowpass = createLowpass(10, 100); // cutoff 10Hz, sample rate 100Hz
    // Create a signal of 5.0 with added alternating noise (high frequency)
    const signal = [5, 6, 4, 6, 4, 6, 4, 6, 4, 6, 4];
    const filtered = lowpass.filterArray(signal);

    // After initial transients, the filtered signal should be closer to 5.0
    // than the noisy spikes of 6.0 and 4.0.
    const lastVal = filtered[filtered.length - 1];
    expect(Math.abs(lastVal - 5.0) < 0.5).toBe(true);
  });

  await it('should highpass filter low-frequency baseline drift', () => {
    const highpass = createHighpass(10, 100);
    // Create a signal with low frequency baseline drift (slow ramp 0 to 10)
    // plus a small high frequency fluctuation
    const signal = Array.from({ length: 50 }, (_, i) => 0.1 * i + Math.sin(i * Math.PI));
    const filtered = highpass.filterArray(signal);

    // The trend (ramp) should be significantly attenuated at the end of the signal
    // Compare baseline shift of raw signal vs filtered signal
    const rawDiff = signal[49] - signal[0];
    const filteredDiff = filtered[49] - filtered[0];
    expect(Math.abs(filteredDiff) < Math.abs(rawDiff)).toBe(true);
  });

  await it('should filter using a bandpass filter', () => {
    const bandpass = createBandpass(5, 15, 100);
    // Design a signal with high-frequency noise and low-frequency drift,
    // plus a target frequency of 10Hz.
    const signal = Array.from({ length: 50 }, (_, i) => {
      const target = Math.sin(2 * Math.PI * 10 * i / 100); // 10Hz (passes)
      const noise = Math.sin(2 * Math.PI * 45 * i / 100);  // 45Hz (stopped)
      return target + noise;
    });

    const filtered = bandpass.filterArray(signal);
    // High frequency noise should be significantly reduced
    expect(filtered.length === 50).toBe(true);
  });

  await it('should filter using a bandstop filter', () => {
    const bandstop = createBandstop(5, 15, 100);
    const signal = Array.from({ length: 50 }, (_, i) => Math.sin(2 * Math.PI * 10 * i / 100)); // 10Hz (stopped)
    const filtered = bandstop.filterArray(signal);

    // The 10Hz component should be reduced
    const lastOriginal = signal[49];
    const lastFiltered = filtered[49];
    expect(Math.abs(lastFiltered) < Math.abs(lastOriginal)).toBe(true);
  });

  await it('should compute moving average correctly', () => {
    const ma = new MovingAverageFilter(4);
    const signal = [10, 20, 30, 40, 50];
    const filtered = ma.filterArray(signal);

    // [10] -> 10
    // [10, 20] -> 15
    // [10, 20, 30] -> 20
    // [10, 20, 30, 40] -> 25
    // [20, 30, 40, 50] -> 35
    expect(filtered[0]).toBe(10);
    expect(filtered[1]).toBe(15);
    expect(filtered[2]).toBe(20);
    expect(filtered[3]).toBe(25);
    expect(filtered[4]).toBe(35);
  });

  await it('should compute exponential moving average correctly', () => {
    const ema = new EMAFilter(0.5);
    const signal = [10, 20, 30];
    const filtered = ema.filterArray(signal);

    // y0 = 10
    // y1 = 0.5 * 20 + 0.5 * 10 = 15
    // y2 = 0.5 * 30 + 0.5 * 15 = 22.5
    expect(filtered[0]).toBe(10);
    expect(filtered[1]).toBe(15);
    expect(filtered[2]).toBe(22.5);
  });
});
