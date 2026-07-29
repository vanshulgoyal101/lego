# Lego Block: `text/ini-parser`

A parser and serializer for INI configuration file format. Parses sections ([section]), key-value pairs, comments (# and ;), inline comments, multi-value keys, and quoted string values. Serializes JavaScript objects back into INI format.

> [!NOTE]
> **AI Agent Context:** Use this block to read .ini, .cfg, or .properties configuration files commonly used in Linux daemons, Python tools, PHP apps, and legacy Windows configuration.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add text/ini-parser
```

---

## API Specifications

### Parameters

*None*

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

* **Time Complexity:** `O(N) lines parsed linearly`
* **Space Complexity:** `O(K) key-value pairs stored`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
