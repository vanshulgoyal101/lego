# Lego Block: `validation/semver`

Semantic Versioning (SemVer 2.0.0) validator, parser, comparator, and range matcher. Parses version strings into { major, minor, patch, prerelease, build } components, compares versions correctly, checks compatibility ranges (^, ~, >=, <, =, ||, -), and sorts version arrays.

> [!NOTE]
> **AI Agent Context:** Use this block for dependency version management, CLI tool version checks, automated release pipelines, or any logic requiring semantic version comparison and range matching.

---

## Installation

To copy this block directly into your project codebase, run the following CLI command:
```bash
npx lego-cli add validation/semver
```

---

## API Specifications

### Parameters

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

* **Time Complexity:** `O(1) parse/compare; O(N log N) sort (N = version count)`
* **Space Complexity:** `O(N) sorted array`

---

## Production Usage Example

Refer to `index.js` inside this folder for full API details.
