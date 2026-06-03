# Lego Block: `agent/chain-runner`

Sequential/branching chain executor for AI agents where each step receives context and returns updated context, with retry, skip, and conditional branching support.

> [!NOTE]
> **AI Agent Context:** Use chain-runner when you need to orchestrate a series of async operations (LLM calls, API fetches, transforms) in a strict order, where each step can inspect and mutate a shared context object. Ideal for multi-step AI pipelines, agentic workflows, ETL-style data flows, or any scenario requiring structured error recovery (retry/skip) and full execution tracing. Prefer it over raw promise chains or ad-hoc loops when auditability, conditional branching, or per-step retry logic matters.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add agent/chain-runner
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `onStep` | `Function` | No | *-* | Callback invoked after every step with { name, status, ctx, duration, error, attempts }. |
| `onError` | `Function` | No | *-* | Callback invoked on each failed attempt with { name, error, attempt }. |


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

* **Time Complexity:** `O(S) steps runner execution count`
* **Space Complexity:** `O(S) context step tracking maps`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
