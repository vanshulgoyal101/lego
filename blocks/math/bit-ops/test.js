import { describe, it, expect } from '../../../test/test-harness.js';
import {
  isPowerOfTwo, nextPowerOfTwo, popCount,
  setBit, clearBit, toggleBit, getBit,
  reverseBits, grayCode, fromGrayCode
} from './index.js';

await describe('math/bit-ops', async () => {
  await it('isPowerOfTwo: should detect powers of two', () => {
    expect(isPowerOfTwo(1)).toBe(true);
    expect(isPowerOfTwo(2)).toBe(true);
    expect(isPowerOfTwo(16)).toBe(true);
    expect(isPowerOfTwo(0)).toBe(false);
    expect(isPowerOfTwo(3)).toBe(false);
    expect(isPowerOfTwo(6)).toBe(false);
  });

  await it('nextPowerOfTwo: should return next power of two', () => {
    expect(nextPowerOfTwo(0)).toBe(1);
    expect(nextPowerOfTwo(1)).toBe(1);
    expect(nextPowerOfTwo(5)).toBe(8);
    expect(nextPowerOfTwo(8)).toBe(8);
    expect(nextPowerOfTwo(9)).toBe(16);
  });

  await it('popCount: should count set bits', () => {
    expect(popCount(0)).toBe(0);
    expect(popCount(1)).toBe(1);
    expect(popCount(0b1011)).toBe(3);
    expect(popCount(0xFF)).toBe(8);
    expect(popCount(0b10110111)).toBe(6);
  });

  await it('setBit: should set a specific bit', () => {
    expect(setBit(0b1010, 0)).toBe(0b1011);
    expect(setBit(0b1010, 2)).toBe(0b1110);
    expect(setBit(0, 3)).toBe(8);
  });

  await it('clearBit: should clear a specific bit', () => {
    expect(clearBit(0b1111, 0)).toBe(0b1110);
    expect(clearBit(0b1010, 1)).toBe(0b1000);
    expect(clearBit(0b1010, 0)).toBe(0b1010); // already 0
  });

  await it('toggleBit: should flip a specific bit', () => {
    expect(toggleBit(0b1010, 0)).toBe(0b1011);
    expect(toggleBit(0b1010, 1)).toBe(0b1000);
    expect(toggleBit(0b1010, 3)).toBe(0b0010);
  });

  await it('getBit: should return 0 or 1', () => {
    expect(getBit(0b1010, 0)).toBe(0);
    expect(getBit(0b1010, 1)).toBe(1);
    expect(getBit(0b1010, 3)).toBe(1);
  });

  await it('reverseBits: should reverse bits in given bit-width', () => {
    // 0b1011 reversed in 4 bits = 0b1101
    expect(reverseBits(0b1011, 4)).toBe(0b1101);
    // 0b0001 reversed in 4 bits = 0b1000
    expect(reverseBits(0b0001, 4)).toBe(0b1000);
  });

  await it('grayCode: should encode to Gray code', () => {
    expect(grayCode(0)).toBe(0); // 0b000 -> 0b000
    expect(grayCode(1)).toBe(1); // 0b001 -> 0b001
    expect(grayCode(2)).toBe(3); // 0b010 -> 0b011
    expect(grayCode(3)).toBe(2); // 0b011 -> 0b010
    expect(grayCode(6)).toBe(5); // 0b110 -> 0b101
  });

  await it('fromGrayCode: should be inverse of grayCode', () => {
    for (const n of [0, 1, 2, 3, 4, 5, 6, 7, 15, 255]) {
      expect(fromGrayCode(grayCode(n))).toBe(n);
    }
  });

  await it('grayCode: consecutive values differ by exactly one bit', () => {
    for (let n = 0; n < 15; n++) {
      const diff = grayCode(n) ^ grayCode(n + 1);
      // diff should be a power of two (exactly one bit set)
      expect(isPowerOfTwo(diff)).toBe(true);
    }
  });
});
