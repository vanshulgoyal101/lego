# Lego Block: `validation/xss-filter`

An HTML XSS sanitizer that removes dangerous script elements, event handler attributes, javascript: protocol links, and data: URI injections from HTML strings. Supports allowlists for safe tags and attributes. Returns sanitized HTML safe for rendering in the browser.

> [!NOTE]
> **AI Agent Context:** Use this block when displaying user-generated HTML content in a browser to prevent Cross-Site Scripting (XSS) attacks. Strips script tags, on* event attributes, and unsafe href/src values.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add validation/xss-filter
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

* **Time Complexity:** `O(N) HTML characters scanned`
* **Space Complexity:** `O(N) sanitized output string`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
