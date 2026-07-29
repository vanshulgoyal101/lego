# Lego Block: `security/csp-builder`

Content Security Policy (CSP) header builder and security validator.

> [!NOTE]
> **AI Agent Context:** Use this block to generate robust, standards-compliant Content Security Policy headers programmatically, and to validate existing CSP configurations for common security vulnerabilities (e.g. missing default-src, wildcard script sources, clickjacking risks). Import using: import { CSPBuilder } from './security/csp-builder/index.js';

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add security/csp-builder
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

* **Time Complexity:** `O(D × V) directive list size`
* **Space Complexity:** `O(D) directive storage size`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
