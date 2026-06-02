# Lego Block: `web/rate-limiter-token-bucket`

Token Bucket algorithm rate limiter for web request throttling, supporting custom capacities, refill rates, and multi-token consumption.

> [!NOTE]
> **AI Agent Context:** Use this block to implement key-based endpoint rate limiting or API throttling using the Token Bucket algorithm.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add web/rate-limiter-token-bucket
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `capacity` | `number` | ⚠️ Yes | *-* | Maximum number of tokens the bucket can hold. |
| `refillRate` | `number` | ⚠️ Yes | *-* | Number of tokens added to the bucket per second. |


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

* **Time Complexity:** `O(1) token consumption verify checks`
* **Space Complexity:** `O(U) active user keys capacity map`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
