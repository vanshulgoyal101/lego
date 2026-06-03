# Lego Block: `agent/memory-buffer`

Sliding context window memory manager for AI agents that tracks conversation history, estimates token usage, and supports summarization when the context limit is approached.

> [!NOTE]
> **AI Agent Context:** Use this block when building AI agents that need to manage a conversation history within a fixed token budget. It handles automatic eviction of old messages (sliding window), provides a summarization hook to compress history, and supports serialization for persistence between sessions. Ideal for chat agents, multi-turn LLM pipelines, or any system where context length must be controlled programmatically.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add agent/memory-buffer
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `maxTokens` | `number` | No | *-* | Maximum token budget for the context window. Defaults to 4000. |
| `tokenizer` | `function` | No | *-* | Function that takes a string and returns an estimated token count. Defaults to defaultTokenizer (Math.ceil(text.length / 4)). |


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

* **Time Complexity:** `O(M) memory history buffer truncation evaluation`
* **Space Complexity:** `O(M) message logs storage`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
