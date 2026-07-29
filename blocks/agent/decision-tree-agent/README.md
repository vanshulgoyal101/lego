# Lego Block: `agent/decision-tree-agent`

A rule-based decision tree agent that evaluates prioritized condition-action rules against a context object and executes the highest-priority matching action.

> [!NOTE]
> **AI Agent Context:** Use this block when you need a lightweight, rule-driven dispatch system: route requests, apply business logic, or orchestrate actions based on runtime context without a full workflow engine. Rules have numeric priorities and are evaluated highest-first; the first matching rule wins in evaluate(), while evaluateAll() runs every matching rule. Ideal for chatbot intent routing, feature-flag gating, alert triage, or any scenario where multiple named conditions must be checked in a defined order.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add agent/decision-tree-agent
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `name` | `string` | ⚠️ Yes | *-* | Unique identifier for a Rule instance. |
| `condition` | `Function` | ⚠️ Yes | *-* | Synchronous function (ctx) => boolean | truthy — determines whether this rule matches the current context. |
| `action` | `Function` | ⚠️ Yes | *-* | Async function (ctx) => result — executed when the rule matches; the return value is surfaced in the evaluate/evaluateAll result. |
| `priority` | `number` | No | *-* | Numeric priority for the rule (default 0). Higher values are evaluated before lower values. |
| `description` | `string` | No | *-* | Human-readable description of the rule's intent (default empty string). |
| `onMatch` | `Function` | No | *-* | DecisionTreeAgent constructor callback — called with { rule, result, ctx } after a successful rule action. |
| `onNoMatch` | `Function` | No | *-* | DecisionTreeAgent constructor callback — called with ctx when no rule matches. |


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

* **Time Complexity:** `O(D) rule conditions checks evaluation depth`
* **Space Complexity:** `O(D)`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
