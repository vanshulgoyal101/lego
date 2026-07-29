# Lego Block: `state/command-pattern`

Command pattern implementation with an undo/redo history stack for executing, reversing, and replaying discrete operations.

> [!NOTE]
> **AI Agent Context:** Use this block when you need undo/redo functionality in editors, drawing apps, form wizards, or any workflow where user actions must be reversible. Commands are plain objects with execute() and undo() methods, making it easy to wrap any operation.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add state/command-pattern
```

---

## API Specifications

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `command` | `Object` | ⚠️ Yes | *-* | A command object with execute() and undo() methods, and an optional description string. |


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

* **Time Complexity:** `O(1) execute/undo/redo transitions`
* **Space Complexity:** `O(H) history list size`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
