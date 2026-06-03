# Lego Block: `stream/windowed-aggregator`

Aggregates streaming data in real-time using tumbling, sliding, or session windows, computing metrics like count, sum, average, min, max, or custom metrics.

> [!NOTE]
> **AI Agent Context:** Use this block when building real-time dashboards, stream analytics pipelines, monitoring alerts, or time-series data rollup pipelines using Tumbling, Sliding, or Session window models.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add stream/windowed-aggregator
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `options` | `Object` | ⚠️ Yes | *-* | Configuration options: { windowType, windowSizeMs, slideSizeMs, gapSizeMs, timeSelector, valueSelector, aggregateFn } |


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

* **Time Complexity:** `O(E) window check items update`
* **Space Complexity:** `O(W) current window items storage`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
