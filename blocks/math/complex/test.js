import { describe, it, expect } from '../../../test/test-harness.js';
import {Complex} from './index.js';

  await describe('math/complex', async () => {
    await it('should perform basic arithmetic', () => {
      const a = new Complex(3, 4);
      const b = new Complex(1, -2);
      expect(a.add(b).re).toBe(4);
      expect(a.add(b).im).toBe(2);
      expect(a.sub(b).re).toBe(2);
      expect(a.sub(b).im).toBe(6);
    });

    await it('should multiply complex numbers using FOIL', () => {
      const a = new Complex(1, 2);
      const b = new Complex(3, 4);
      // (1+2i)(3+4i) = 3+4i+6i+8i² = 3+10i-8 = -5+10i
      const result = a.mul(b);
      expect(result.re).toBe(-5);
      expect(result.im).toBe(10);
    });

    await it('should divide complex numbers', () => {
      const a = new Complex(4, 2);
      const b = new Complex(2, 0);
      const result = a.div(b);
      expect(result.re).toBe(2);
      expect(result.im).toBe(1);
    });

    await it('should compute abs (modulus) and arg (angle)', () => {
      const z = new Complex(3, 4);
      expect(z.abs()).toBe(5);
      expect(z.arg()).toBeCloseTo(Math.atan2(4, 3));
    });

    await it('should compute conjugate', () => {
      const z = new Complex(3, -4);
      const conj = z.conjugate();
      expect(conj.re).toBe(3);
      expect(conj.im).toBe(4);
    });

    await it('should compute exp of imaginary number (Eulers formula: e^(i*pi) = -1)', () => {
      const z = new Complex(0, Math.PI);
      const result = z.exp();
      expect(Math.abs(result.re + 1)).toBeLessThan(1e-10);
      expect(Math.abs(result.im)).toBeLessThan(1e-10);
    });

    await it('should compute sqrt of complex number', () => {
      const z = new Complex(-4, 0); // sqrt(-4) = 2i
      const result = z.sqrt();
      expect(Math.abs(result.re)).toBeLessThan(1e-10);
      expect(Math.abs(result.im - 2)).toBeLessThan(1e-10);
    });

    await it('should convert to and from polar form', () => {
      const z = new Complex(1, 1);
      const { r, theta } = z.toPolar();
      expect(Math.abs(r - Math.sqrt(2))).toBeLessThan(1e-10);
      const back = Complex.fromPolar(r, theta);
      expect(back.equals(z)).toBe(true);
    });
  });
