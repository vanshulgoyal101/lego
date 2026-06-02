import { describe, it, expect } from '../../../test/test-harness.js';
import { aStar } from './index.js';

await describe('algo/a-star', async () => {
  await it('should find a direct path on an open grid', () => {
    const grid = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    const path = aStar(grid, { x: 0, y: 0 }, { x: 2, y: 2 });
    expect(path === null).toBe(false);
    expect(path[0]).toEqual({ x: 0, y: 0 });
    expect(path[path.length - 1]).toEqual({ x: 2, y: 2 });
  });

  await it('should navigate around obstacles', () => {
    const grid = [
      [0, 0, 0],
      [1, 1, 0],
      [0, 0, 0],
    ];
    const path = aStar(grid, { x: 0, y: 0 }, { x: 2, y: 2 });
    expect(path === null).toBe(false);
    // Path must not go through blocked cells
    const blocked = path.filter(p => grid[p.y][p.x] === 1);
    expect(blocked.length).toBe(0);
    expect(path[path.length - 1]).toEqual({ x: 2, y: 2 });
  });

  await it('should return null when no path exists', () => {
    const grid = [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ];
    const path = aStar(grid, { x: 0, y: 0 }, { x: 2, y: 2 });
    expect(path).toBe(null);
  });

  await it('should return single-node path when start equals goal', () => {
    const grid = [[0, 0], [0, 0]];
    const path = aStar(grid, { x: 1, y: 1 }, { x: 1, y: 1 });
    expect(path).toEqual([{ x: 1, y: 1 }]);
  });

  await it('should accept a custom heuristic', () => {
    const grid = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    const chebyshev = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
    const path = aStar(grid, { x: 0, y: 0 }, { x: 2, y: 2 }, chebyshev);
    expect(path === null).toBe(false);
    expect(path[path.length - 1]).toEqual({ x: 2, y: 2 });
  });
});
