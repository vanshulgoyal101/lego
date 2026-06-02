/**
 * @module algo/a-star
 *
 * A* (A-Star) pathfinding algorithm for 2D grids.
 *
 * A* extends Dijkstra's algorithm with a heuristic function h(n) that
 * estimates the cost from node n to the goal. It always expands the node
 * with the lowest f = g + h score, guaranteeing the shortest path when
 * the heuristic is admissible (never over-estimates).
 *
 * Default heuristic: Manhattan distance — optimal for 4-directional movement.
 *
 * Grid convention:
 *   - 0 = passable cell
 *   - 1 = obstacle / wall
 *   - Coordinates: x = column index, y = row index
 */

/**
 * @typedef {{x: number, y: number}} Point
 */

/**
 * Default Manhattan distance heuristic (admissible for 4-directional grids).
 * @param {Point} a
 * @param {Point} b
 * @returns {number}
 */
function manhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * Minimal binary min-heap used internally for the open set.
 * Stores {cost, node} objects and pops by lowest cost.
 * @private
 */
class MinHeap {
  constructor() {
    this._data = [];
  }

  push(item) {
    this._data.push(item);
    this._bubbleUp(this._data.length - 1);
  }

  pop() {
    const top = this._data[0];
    const last = this._data.pop();
    if (this._data.length > 0) {
      this._data[0] = last;
      this._siftDown(0);
    }
    return top;
  }

  get size() { return this._data.length; }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this._data[parent].cost <= this._data[i].cost) break;
      [this._data[parent], this._data[i]] = [this._data[i], this._data[parent]];
      i = parent;
    }
  }

  _siftDown(i) {
    const n = this._data.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this._data[l].cost < this._data[smallest].cost) smallest = l;
      if (r < n && this._data[r].cost < this._data[smallest].cost) smallest = r;
      if (smallest === i) break;
      [this._data[smallest], this._data[i]] = [this._data[i], this._data[smallest]];
      i = smallest;
    }
  }
}

const DIRS = [{x:0,y:-1},{x:0,y:1},{x:-1,y:0},{x:1,y:0}];

/**
 * Finds the shortest path on a 2D grid from start to goal using A*.
 *
 * @param {number[][]} grid       - 2D array (rows × cols). 0 = open, 1 = blocked.
 * @param {Point}      start      - Starting cell {x (col), y (row)}.
 * @param {Point}      goal       - Target cell {x (col), y (row)}.
 * @param {Function}   [heuristic=manhattan] - Admissible heuristic (a, b) => number.
 * @returns {Point[]|null} Ordered array of {x, y} cells from start to goal
 *   (inclusive), or null if no path exists.
 *
 * @example
 * const grid = [
 *   [0, 0, 0],
 *   [1, 1, 0],
 *   [0, 0, 0],
 * ];
 * aStar(grid, {x:0, y:0}, {x:2, y:2});
 * // [{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:2,y:1},{x:2,y:2}]
 */
export function aStar(grid, start, goal, heuristic = manhattan) {
  const rows = grid.length;
  const cols = grid[0].length;

  const key = (x, y) => `${x},${y}`;
  const gScore = new Map();
  const cameFrom = new Map();
  const open = new MinHeap();

  const startKey = key(start.x, start.y);
  gScore.set(startKey, 0);
  open.push({ cost: heuristic(start, goal), x: start.x, y: start.y });

  while (open.size > 0) {
    const { x, y } = open.pop();
    const k = key(x, y);

    if (x === goal.x && y === goal.y) {
      // Reconstruct path
      const path = [];
      let cur = k;
      while (cur !== undefined) {
        const [cx, cy] = cur.split(',').map(Number);
        path.push({ x: cx, y: cy });
        cur = cameFrom.get(cur);
      }
      return path.reverse();
    }

    const g = gScore.get(k);

    for (const dir of DIRS) {
      const nx = x + dir.x;
      const ny = y + dir.y;
      if (nx < 0 || ny < 0 || ny >= rows || nx >= cols) continue;
      if (grid[ny][nx] === 1) continue;

      const nk = key(nx, ny);
      const ng = g + 1; // uniform cost grid

      if (ng < (gScore.get(nk) ?? Infinity)) {
        gScore.set(nk, ng);
        cameFrom.set(nk, k);
        open.push({ cost: ng + heuristic({ x: nx, y: ny }, goal), x: nx, y: ny });
      }
    }
  }

  return null; // No path found
}
