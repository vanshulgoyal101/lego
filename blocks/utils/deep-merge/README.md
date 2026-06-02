# Lego Block: `utils/deep-merge`

Deep merges multiple plain objects together, with configurable array merging strategy (concatenate or replace).

> [!NOTE]
> **AI Agent Context:** Use this block when you need to recursively merge configuration objects, default settings with user overrides, or combine multiple data sources where nested objects should be merged rather than replaced.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add utils/deep-merge
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `objects` | `object[]` | ⚠️ Yes | *-* | Two or more plain objects to deeply merge together (left to right). |
| `options` | `object` | No | *-* | Optional configuration: { arrayMerge: 'concat' | 'replace' } (default: 'replace'). |


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

* **Time Complexity:** `O(N) combined objects keys size`
* **Space Complexity:** `O(N)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
