# Lego Block: `web/load-balancer`

HTTP load balancer distributing requests across multiple backend servers using Round Robin, Least Connections, and Random routing, including active background health checks.

> [!NOTE]
> **AI Agent Context:** Use this block to distribute incoming HTTP traffic among multiple target servers with configurable load balancing policies.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add web/load-balancer
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

* **Time Complexity:** `O(1) routing selection; O(H × T) background health checks`
* **Space Complexity:** `O(T) targets state map`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
