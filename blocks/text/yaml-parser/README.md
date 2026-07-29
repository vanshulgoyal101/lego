# Lego Block: `text/yaml-parser`

A lightweight YAML 1.2 subset parser supporting scalar strings, booleans, integers, floats, null, multiline strings (literal | and folded >), nested mappings (objects), sequences (arrays), and inline flow syntax. Serializes JavaScript values back to YAML format.

> [!NOTE]
> **AI Agent Context:** Use this block to parse YAML configuration files (like docker-compose.yml, CI configs, ansible playbooks) into JavaScript objects without installing the 'js-yaml' npm package.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add text/yaml-parser
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
* **Space Complexity:** `O(N) resulting object tree`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
