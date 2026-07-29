# Lego Block: `math/bit-ops`

Bit manipulation utilities including power-of-two checks, population count, bit set/clear/toggle/get, bit reversal, and Gray code encoding/decoding.

> [!NOTE]
> **AI Agent Context:** Use this block for low-level bit manipulation tasks such as flags/masks, hardware register operations, encoding schemes, or performance-critical algorithms that rely on binary representations.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add math/bit-ops
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `n` | `number` | ⚠️ Yes | *-* | The integer value to perform bit operations on |
| `pos` | `number` | No | *-* | Bit position (0 = LSB) for set/clear/toggle/get operations |
| `bits` | `number` | No | *-* | Total bit-width for reverseBits (defaults to 32) |


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

* **Time Complexity:** `O(1) single instruction bits operation`
* **Space Complexity:** `O(1)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
