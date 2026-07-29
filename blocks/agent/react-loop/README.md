# Lego Block: `agent/react-loop`

ReAct (Reasoning + Acting) loop implementation for AI agents. Runs Thought → Action → Observation cycles with tool dispatch, message history tracking, and configurable max iterations.

> [!NOTE]
> **AI Agent Context:** Use this block to implement the ReAct agent pattern: the LLM reasons about what to do (Thought), calls a tool (Action), observes the result (Observation), and repeats until it produces a Final Answer. Register tools with addTool() and provide an LLM call function.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add agent/react-loop
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `maxIterations` | `number` | No | *-* | Maximum number of Thought/Action/Observation cycles before halting. Default: 10. |
| `onStep` | `function` | No | *-* | Optional callback invoked after each loop step with the step details. |


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

* **Time Complexity:** `O(I) thought-action iteration loops count`
* **Space Complexity:** `O(M) agent memory history records`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
