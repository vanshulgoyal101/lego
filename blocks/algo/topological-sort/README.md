# Lego Block: `algo/topological-sort`

Topological sort for Directed Acyclic Graphs (DAGs). Implements both Kahn's BFS algorithm and DFS-based approaches. Detects cycles and throws a descriptive error. Used for dependency resolution, task scheduling, and build systems.

> [!NOTE]
> **AI Agent Context:** Use this block to resolve dependency order for tasks, packages, build steps, or class hierarchies represented as directed acyclic graphs.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add algo/topological-sort
```

---

## API Specifications

### Parameters

*None*

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

* **Time Complexity:** `O(V + E) Kahn's BFS / DFS`
* **Space Complexity:** `O(V + E)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
