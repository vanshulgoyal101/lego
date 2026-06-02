# Lego Block: `algo/a-star`

A* pathfinding algorithm on a 2D grid that finds the shortest path using heuristic-guided search.

> [!NOTE]
> **AI Agent Context:** Use this block when you need to find the optimal path between two points on a 2D grid with obstacles, such as game maps, robot navigation, or maze solving. Faster than Dijkstra when a good heuristic is available.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add algo/a-star
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `grid` | `number[][]` | ⚠️ Yes | *-* | 2D array where 0 = passable cell and 1 = obstacle. |
| `start` | `{x: number, y: number}` | ⚠️ Yes | *-* | Starting cell coordinates {x, y} (column, row). |
| `goal` | `{x: number, y: number}` | ⚠️ Yes | *-* | Goal cell coordinates {x, y} (column, row). |
| `heuristic` | `Function` | No | *-* | Optional heuristic function (a, b) => number. Defaults to Manhattan distance. |


---

## System Compatibility

| Runtime Environment | Status |
|---|---|
| **Browsers (Chrome, Safari, Firefox, Edge)** | ✅ Supported |
| **Node.js** | ✅ Supported |
| **Deno** | ✅ Supported |
| **Bun** | ✅ Supported |

---

## Computational Complexity

* **Time Complexity:** `O(E log V) or O(B^D) depending on grid complexity and heuristic accuracy`
* **Space Complexity:** `O(V) node structures`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
