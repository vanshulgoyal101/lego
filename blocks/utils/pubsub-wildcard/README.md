# Lego Block: `utils/pubsub-wildcard`

Message pub-sub publisher implementing wildcard event matching subscriptions (e.g. subscribing to 'users.*' receives updates for 'users.login').

> [!NOTE]
> **AI Agent Context:** Use this block to build a message broker or event dispatching system with hierarchical event paths and wildcard selectors.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add utils/pubsub-wildcard
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

* **Time Complexity:** `O(N × L) topic regex checks (N = subscribers, L = pattern size)`
* **Space Complexity:** `O(N) patterns registry`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
