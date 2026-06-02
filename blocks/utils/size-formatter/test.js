import { describe, it, expect } from '../../../test/test-harness.js';
import { formatBytes, parseBytes, getSupportedUnits } from './index.js';

await describe('utils/size-formatter', async () => {
  await it('should format 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  await it('should format bytes without unit change', () => {
    expect(formatBytes(512)).toBe('512.00 B');
  });

  await it('should format kilobytes correctly', () => {
    expect(formatBytes(1000)).toBe('1.00 KB');
    expect(formatBytes(1500)).toBe('1.50 KB');
  });

  await it('should format megabytes correctly', () => {
    expect(formatBytes(1000000)).toBe('1.00 MB');
    expect(formatBytes(1234567)).toBe('1.23 MB');
  });

  await it('should format gigabytes correctly', () => {
    expect(formatBytes(1000000000)).toBe('1.00 GB');
  });

  await it('should respect custom decimal places', () => {
    expect(formatBytes(1500, 0)).toBe('2 KB');
    expect(formatBytes(1500, 3)).toBe('1.500 KB');
  });

  await it('should support IEC units (base 1024)', () => {
    expect(formatBytes(1024, 2, 'iec')).toBe('1.00 KiB');
    expect(formatBytes(1048576, 2, 'iec')).toBe('1.00 MiB');
  });

  await it('should throw on negative bytes', () => {
    expect(() => formatBytes(-1)).toThrow('non-negative');
  });

  await it('should throw on non-numeric bytes', () => {
    expect(() => formatBytes('1 MB')).toThrow('non-negative');
  });

  await it('should parse SI size strings', () => {
    expect(parseBytes('1 KB')).toBe(1000);
    expect(parseBytes('1.5 MB')).toBe(1500000);
    expect(parseBytes('2 GB')).toBe(2000000000);
  });

  await it('should parse IEC size strings', () => {
    expect(parseBytes('1 KiB')).toBe(1024);
    expect(parseBytes('1 MiB')).toBe(1048576);
  });

  await it('should parse size strings without spaces', () => {
    expect(parseBytes('512B')).toBe(512);
    expect(parseBytes('1KB')).toBe(1000);
  });

  await it('should throw on invalid size strings', () => {
    expect(() => parseBytes('not a size')).toThrow('Cannot parse');
  });

  await it('should round-trip: formatBytes then parseBytes', () => {
    const original = 5000000;
    const str = formatBytes(original, 2);
    const parsed = parseBytes(str);
    expect(Math.abs(parsed - original) < 100).toBe(true);
  });

  await it('should return supported units array', () => {
    const si = getSupportedUnits('si');
    expect(si[0]).toBe('B');
    expect(si[2]).toBe('MB');
    const iec = getSupportedUnits('iec');
    expect(iec[1]).toBe('KiB');
  });
});
