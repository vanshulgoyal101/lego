# Lego Block: `math/stats`

Statistics math helper supporting mean, median, mode, variance, standard deviation, and percentile calculations.

> [!NOTE]
> **AI Agent Context:** Use this block when processing numerical analysis lists, summarizing database metric query columns, or plotting dashboard graphics charts (calculating medians or percentiles like p95 or p99). Import using: import { mean, stdDev } from './math/stats.js';

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add math/stats
```

---

## API Specifications

### Parameters

*None*

### Tags

*None*

### Use Cases

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

* **Time Complexity:** `O(N) mean/sum/variance; O(N log N) median (sort)`
* **Space Complexity:** `O(N) input copy for sort`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
