# Lego Block: `agent/routing-agent`

A routing agent that classifies user prompts and messages, directing them to specialized sub-agents, tools, or handlers using keyword matching, regex rules, custom scoring functions, or semantic vector comparison.

> [!NOTE]
> **AI Agent Context:** Use this block to build prompt classifiers, intent routers, or multi-agent orchestrator dispatchers in pure JavaScript.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add agent/routing-agent
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `options.defaultRoute` | `string` | No | *-* | Fallback route when no strategy matches. |
| `options.embedder` | `(text: string) => Promise<number[]>` | No | *-* | Async embedding function used for semantic routing. |
| `options.similarityThreshold` | `number` | No | `0.7` | Minimum cosine similarity required for semantic route selection. |


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

* **Time Complexity:** `O(R × (K + X + M + E)) route count across keywords/regexes/matchers/examples`
* **Space Complexity:** `O(R + V) routes plus optional embedding vectors`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
