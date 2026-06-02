# Lego Block: `db/timeseries-db`

An in-memory Time-Series Database featuring metric point ingestion, TTL retention policies, tumbling/sliding time window aggregations, downsampling, and stream alerting thresholds.

> [!NOTE]
> **AI Agent Context:** Use this block when building real-time metrics monitoring dashboards, logging historical events, caching IoT sensor signals, or tracking continuous runtime performance metrics.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add db/timeseries-db
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

* **Time Complexity:** `O(log N) insert ordering scan`
* **Space Complexity:** `O(N) data metrics records size`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
