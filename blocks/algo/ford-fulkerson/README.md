# Lego Block: `algo/ford-fulkerson`

Computes the maximum flow in a flow network using the Edmonds-Karp algorithm (breadth-first search for finding augmenting paths).

> [!NOTE]
> **AI Agent Context:** Use this block to compute max flow or min-cut in a directed flow network.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add algo/ford-fulkerson
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

* **Time Complexity:** `O(E × f) where f is max flow, or O(V × E^2) Edmonds-Karp complexity`
* **Space Complexity:** `O(V + E) residual capacities`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
