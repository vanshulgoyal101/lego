/**
 * @module algo/flood-fill
 *
 * Flood fill and boundary fill algorithms for 2D grids.
 *
 * `floodFill` — classic paint-bucket fill: starting from a seed cell,
 *   replaces all connected cells that share the seed's original value with
 *   a new value. Uses iterative BFS to avoid stack overflow on large grids.
 *   4-connectivity (up/down/left/right) by default.
 *
 * `boundaryFill` — fills the connected region reachable from a seed without
 *   crossing cells that have the boundary value. Useful for closed-region
 *   fills where the boundary is a different colour from the interior.
 *
 * Both functions return a deep copy of the grid — the original is not mutated.
 */

const DIRS_4 = [[-1, 0], [1, 0], [0, -1], [0, 1]];

/**
 * Deep-copies a 2D array.
 * @param {Array[]} grid
 * @returns {Array[]}
 * @private
 */
function copyGrid(grid) {
  return grid.map(row => row.slice());
}

/**
 * Fills the connected region starting at (startRow, startCol) with newValue.
 * Connectivity is 4-directional (orthogonal neighbours only).
 * Returns a modified copy — the original grid is not mutated.
 *
 * @param {Array[]}  grid     - 2D array of comparable values.
 * @param {number}   startRow - Row index of the seed cell.
 * @param {number}   startCol - Column index of the seed cell.
 * @param {*}        newValue - Value to fill the connected region with.
 * @returns {Array[]} A new 2D grid with the fill applied.
 *
 * @example
 * const grid = [
 *   [1, 1, 1],
 *   [1, 0, 0],
 *   [1, 1, 0],
 * ];
 * floodFill(grid, 1, 1, 2);
 * // [[1,1,1],[1,2,2],[1,1,2]]
 */
export function floodFill(grid, startRow, startCol, newValue) {
  const rows = grid.length;
  if (rows === 0) return [];
  const cols = grid[0].length;

  if (startRow < 0 || startRow >= rows || startCol < 0 || startCol >= cols) {
    throw new Error(`Seed (${startRow}, ${startCol}) is out of bounds.`);
  }

  const result = copyGrid(grid);
  const targetValue = result[startRow][startCol];

  // Nothing to do if the seed is already the new value
  if (targetValue === newValue) return result;

  const queue = [[startRow, startCol]];
  result[startRow][startCol] = newValue;

  while (queue.length > 0) {
    const [row, col] = queue.shift();
    for (const [dr, dc] of DIRS_4) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && result[nr][nc] === targetValue) {
        result[nr][nc] = newValue;
        queue.push([nr, nc]);
      }
    }
  }

  return result;
}

/**
 * Fills the connected region reachable from a seed cell without crossing
 * cells that carry the boundary value. Unlike floodFill, any existing cell
 * value that is neither the fill value nor the boundary value will be replaced.
 *
 * Useful when the boundary separating regions has a distinct marker value.
 *
 * @param {Array[]}  grid        - 2D array of comparable values.
 * @param {[number, number]} start - Seed cell [row, col].
 * @param {*}        boundary    - Cells with this value act as walls.
 * @param {*}        fill        - Value to paint the reachable region.
 * @returns {Array[]} A new 2D grid with the fill applied.
 *
 * @example
 * const g = [
 *   [0, 0, 0, 0],
 *   [0, 9, 9, 0],
 *   [0, 9, 0, 0],
 *   [0, 0, 0, 0],
 * ];
 * boundaryFill(g, [0, 0], 9, 5);
 * // fills all 0s reachable from [0,0] without crossing 9s
 */
export function boundaryFill(grid, start, boundary, fill) {
  const rows = grid.length;
  if (rows === 0) return [];
  const cols = grid[0].length;
  const [startRow, startCol] = start;

  if (startRow < 0 || startRow >= rows || startCol < 0 || startCol >= cols) {
    throw new Error(`Seed (${startRow}, ${startCol}) is out of bounds.`);
  }

  const result = copyGrid(grid);

  // Don't fill if the seed is already the fill value or a boundary
  if (result[startRow][startCol] === fill || result[startRow][startCol] === boundary) {
    return result;
  }

  const queue = [[startRow, startCol]];
  result[startRow][startCol] = fill;

  while (queue.length > 0) {
    const [row, col] = queue.shift();
    for (const [dr, dc] of DIRS_4) {
      const nr = row + dr;
      const nc = col + dc;
      if (
        nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
        result[nr][nc] !== fill && result[nr][nc] !== boundary
      ) {
        result[nr][nc] = fill;
        queue.push([nr, nc]);
      }
    }
  }

  return result;
}
