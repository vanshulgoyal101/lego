# Lego Block: `utils/throttle`

Throttling wrapper to ensure a function runs at most once in a specified time window.

> [!NOTE]
> **AI Agent Context:** Use this block when handling events that trigger continuously (like scroll, mouse move, or window resize) to update UI layouts or fetch analytics without slowing down page frames rate.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add utils/throttle
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `func` | `Function` | ⚠️ Yes | *-* | The target action function to throttle. |
| `wait` | `number` | ⚠️ Yes | *-* | The window delay in milliseconds. |


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

* **Time Complexity:** `O(1) per call (timer check)`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
