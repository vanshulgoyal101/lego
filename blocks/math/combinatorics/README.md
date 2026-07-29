# Lego Block: `math/combinatorics`

Combinatorial math utilities including factorial, binomial coefficients, permutations, combinations, Cartesian product, and power set generation.

> [!NOTE]
> **AI Agent Context:** Use this block for combinatorics problems such as counting arrangements, generating all subsets, computing probabilities, or enumerating combinations in algorithms and puzzles.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add math/combinatorics
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `n` | `number` | No | *-* | Non-negative integer for factorial or choose(n, k) |
| `k` | `number` | No | *-* | Selection size for choose(n, k) or combinations(arr, k) |
| `arr` | `Array` | No | *-* | Input array for permutations, combinations, or powerSet |


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

* **Time Complexity:** `O(N! / (N-K)!) permutations and combinations generation`
* **Space Complexity:** `O(N!) array output`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
