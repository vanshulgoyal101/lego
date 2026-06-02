/**
 * Shared unsafe-key policy for untrusted object key handling.
 * Use this guard before writing attacker-controlled keys into objects.
 */

export const UNSAFE_OBJECT_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

export function isUnsafeObjectKey(key) {
  return typeof key === 'string' && UNSAFE_OBJECT_KEYS.has(key);
}

