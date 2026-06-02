# Security Policy

## Supported Versions

This repository is under active development. Security fixes are applied to the latest default branch.

## Reporting a Vulnerability

If you find a security issue, please open a private security advisory in GitHub (preferred) or open an issue with **no exploit details** and request a private follow-up.

When reporting, include:
- affected block(s) and file path(s)
- minimal reproduction payload
- impact assessment
- suggested remediation (if available)

## Threat Model

Primary trust boundary:
- Inputs to blocks are considered untrusted by default (HTTP payloads, query strings, parser input, serialized payloads, user-provided HTML/text).

Key risks:
- Prototype pollution via parser/decoder/object-path helpers.
- Injection and sanitizer bypass in HTML/query/URL handling.
- Path traversal and unsafe file access in filesystem/network-facing blocks.
- Denial-of-service via unbounded recursion, deeply nested payloads, and large attacker-controlled inputs.
- Cryptographic misuse (weak randomness, unsafe defaults).

## Secure Coding Checklist (for new and updated blocks)

- Validate and bound untrusted input size, depth, and format.
- Block unsafe object keys: `__proto__`, `prototype`, `constructor`.
- Avoid writing attacker-controlled keys to plain objects without guards.
- Prefer safe object creation (`Object.create(null)`) for untrusted key maps.
- Reject dangerous URL schemes and sanitize/escape output contexts correctly.
- Use cryptographically secure randomness for security-sensitive operations.
- Add regression tests for abuse payloads (prototype pollution, injection, parser edge cases).
- Document security assumptions and limitations in block README metadata.

