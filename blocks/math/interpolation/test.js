import { describe, it, expect } from '../../../test/test-harness.js';
import { lerp, bilinear, lagrange, cubicSpline } from './index.js';

await describe('math/interpolation', async () => {
  await it('lerp: should interpolate halfway between two values', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 1)).toBe(10);
  });

  await it('lerp: should work with negative ranges', () => {
    expect(lerp(-10, 10, 0.5)).toBe(0);
    expect(lerp(-10, 10, 0.25)).toBe(-5);
  });

  await it('bilinear: should return corner values at t=0 or t=1', () => {
    // At (0,0) should equal q11
    expect(bilinear(0, 0, 1, 2, 3, 4)).toBe(1);
    // At (1,0) should equal q21
    expect(bilinear(1, 0, 1, 2, 3, 4)).toBe(3);
    // At (0,1) should equal q12
    expect(bilinear(0, 1, 1, 2, 3, 4)).toBe(2);
    // At (1,1) should equal q22
    expect(bilinear(1, 1, 1, 2, 3, 4)).toBe(4);
  });

  await it('bilinear: should interpolate at center', () => {
    // All corners equal → result equals that value
    expect(bilinear(0.5, 0.5, 4, 4, 4, 4)).toBe(4);
  });

  await it('lagrange: should pass through all given points', () => {
    const pts = [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 4 }];
    expect(lagrange(pts, 0)).toBeCloseTo(0, 5);
    expect(lagrange(pts, 1)).toBeCloseTo(1, 5);
    expect(lagrange(pts, 2)).toBeCloseTo(4, 5);
  });

  await it('lagrange: should interpolate x^2 correctly at midpoint', () => {
    // Points from y = x^2
    const pts = [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 4 }, { x: 3, y: 9 }];
    expect(lagrange(pts, 1.5)).toBeCloseTo(2.25, 3);
  });

  await it('lagrange: should throw on empty points', () => {
    expect(() => lagrange([], 1)).toThrow('empty');
  });

  await it('cubicSpline: should pass through knot points', () => {
    const pts = [
      { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 0 }, { x: 3, y: 1 }
    ];
    expect(cubicSpline(pts, 0)).toBeCloseTo(0, 5);
    expect(cubicSpline(pts, 1)).toBeCloseTo(1, 5);
    expect(cubicSpline(pts, 2)).toBeCloseTo(0, 5);
    expect(cubicSpline(pts, 3)).toBeCloseTo(1, 5);
  });

  await it('cubicSpline: should clamp to boundary values', () => {
    const pts = [{ x: 0, y: 5 }, { x: 1, y: 10 }];
    expect(cubicSpline(pts, -1)).toBe(5);
    expect(cubicSpline(pts, 2)).toBe(10);
  });
});
