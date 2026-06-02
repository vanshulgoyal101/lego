# Lego Block: `utils/pubsub`

A lightweight topic-based Publish-Subscribe (PubSub) message bus. Supports wildcard topic matching (*, **), synchronous and asynchronous delivery, message history replay for late subscribers, one-time subscribers, and unsubscription.

> [!NOTE]
> **AI Agent Context:** Use this block to decouple components using events across modules, implement cross-component communication in frontend apps, or build lightweight service bus messaging without external dependencies.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add utils/pubsub
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

* **Time Complexity:** `O(S × P) publish (S = subscribers, P = pattern match per subscriber)`
* **Space Complexity:** `O(S + H) subscribers + history`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
