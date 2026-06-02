import { describe, it, expect } from '../../../test/test-harness.js';
import { floodFill, boundaryFill } from './index.js';

await describe('algo/flood-fill', async () => {
  await it('should fill a contiguous region', () => {
    const grid = [
      [1, 1, 1],
      [1, 0, 0],
      [1, 1, 0],
    ];
    const result = floodFill(grid, 1, 1, 2);
    expect(result[1][1]).toBe(2);
    expect(result[1][2]).toBe(2);
    expect(result[2][2]).toBe(2);
    // Boundary cells unchanged
    expect(result[0][0]).toBe(1);
  });

  await it('should not modify the original grid', () => {
    const grid = [[0, 0], [0, 0]];
    floodFill(grid, 0, 0, 5);
    expect(grid[0][0]).toBe(0);
  });

  await it('should return unchanged grid when seed already equals new value', () => {
    const grid = [[1, 1], [1, 0]];
    const result = floodFill(grid, 0, 0, 1);
    expect(result).toEqual(grid);
  });

  await it('should handle single-cell grid', () => {
    const result = floodFill([[7]], 0, 0, 9);
    expect(result).toEqual([[9]]);
  });

  await it('should throw on out-of-bounds seed', () => {
    const grid = [[0, 0], [0, 0]];
    let threw = false;
    try { floodFill(grid, 5, 5, 1); } catch (e) { threw = true; }
    expect(threw).toBe(true);
  });

  await it('should fill the entire open grid when all cells are same value', () => {
    const grid = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    const result = floodFill(grid, 1, 1, 3);
    for (const row of result) {
      for (const cell of row) expect(cell).toBe(3);
    }
  });

  await it('boundaryFill should fill up to the boundary value', () => {
    const grid = [
      [0, 0, 0, 0],
      [0, 9, 9, 0],
      [0, 9, 0, 0],
      [0, 0, 0, 0],
    ];
    const result = boundaryFill(grid, [0, 0], 9, 5);
    expect(result[0][0]).toBe(5);
    expect(result[0][3]).toBe(5);
    expect(result[3][3]).toBe(5);
    // Boundary cells should be untouched
    expect(result[1][1]).toBe(9);
    expect(result[1][2]).toBe(9);
  });

  await it('boundaryFill should not modify original grid', () => {
    const grid = [[0, 9], [0, 0]];
    boundaryFill(grid, [0, 0], 9, 7);
    expect(grid[0][0]).toBe(0);
  });

  await it('boundaryFill should do nothing when seed is a boundary cell', () => {
    const grid = [[9, 0], [0, 0]];
    const result = boundaryFill(grid, [0, 0], 9, 5);
    expect(result[0][0]).toBe(9);
    expect(result[1][1]).toBe(0);
  });
});
