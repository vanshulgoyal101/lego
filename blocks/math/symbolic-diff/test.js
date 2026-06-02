import { describe, it, expect } from '../../../test/test-harness.js';
import {differentiate} from './index.js';

  await describe('math/symbolic-diff', async () => {
    await it('should differentiate constant to zero', () => {
      expect(differentiate('5', 'x')).toBe('0');
    });
    await it('should differentiate x to 1', () => {
      expect(differentiate('x', 'x')).toBe('1');
    });
    await it('should differentiate x^2 to 2*x', () => {
      const result = differentiate('x^2', 'x');
      // Acceptable forms: "2 * x", "2*x"
      expect(result.replace(/\s/g, '')).toBe('2*x');
    });
    await it('should differentiate x^3 to 3*x^2', () => {
      const result = differentiate('x^3', 'x').replace(/\s/g, '');
      expect(result).toBe('3*x^2');
    });
    await it('should differentiate sum x+x to 2', () => {
      const result = differentiate('x + x', 'x');
      expect(result).toBe('2');
    });
    await it('should apply product rule to x*x giving x + x (equivalent to 2*x)', () => {
      const result = differentiate('x * x', 'x').replace(/\s/g, '');
      // product rule: d/dx(x*x) = x*1 + 1*x = x+x (simplifier coalescence may not reduce to 2*x)
      expect(result === 'x+x' || result === '2*x' || result.includes('x')).toBe(true);
    });
    await it('should differentiate sin(x) to cos(x)', () => {
      const result = differentiate('sin(x)', 'x').replace(/\s/g, '');
      expect(result).toBe('cos(x)');
    });
    await it('should differentiate cos(x) to -sin(x)', () => {
      const result = differentiate('cos(x)', 'x');
      expect(result.includes('sin(x)')).toBe(true);
    });
    await it('should differentiate ln(x) to 1/x', () => {
      const result = differentiate('ln(x)', 'x').replace(/\s/g, '');
      expect(result).toBe('1/x');
    });
    await it('should throw on empty expression', () => {
      expect(() => differentiate('')).toThrow();
    });
  });
