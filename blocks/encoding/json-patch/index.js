/**
 * RFC 6902 JSON Patch implementation.
 *
 * Supports all six standard operations:
 *  - add    – Insert a value at a path (or append to array with "-").
 *  - remove – Delete the value at a path.
 *  - replace – Set the value at a path to a new value.
 *  - copy   – Copy a value from one path to another.
 *  - move   – Move a value from one path to another.
 *  - test   – Assert that a path holds an expected value.
 *
 * Paths use JSON Pointer syntax (RFC 6901), e.g. "/a/b/0".
 */

/**
 * Splits a JSON Pointer string into an array of unescaped path tokens.
 *
 * @param {string} pointer - JSON Pointer (e.g. "/a/b/0" or "").
 * @returns {string[]} Array of path segments.
 */
function parsePath(pointer) {
  if (pointer === '') return [];
  if (!pointer.startsWith('/')) {
    throw new Error(`Invalid JSON Pointer: "${pointer}"`);
  }
  return pointer.slice(1).split('/').map(s => s.replace(/~1/g, '/').replace(/~0/g, '~'));
}

function isUnsafeKey(part) {
  return part === '__proto__' || part === 'prototype' || part === 'constructor';
}

function assertSafePath(parts, sourcePath) {
  for (const part of parts) {
    if (isUnsafeKey(part)) {
      throw new Error(`Unsafe JSON Pointer segment in path "${sourcePath}"`);
    }
  }
}

/**
 * Deep-clones a JSON-serialisable value.
 * @param {*} value
 * @returns {*}
 */
function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Retrieves a nested value from a document using a parsed path array.
 *
 * @param {*}        doc   - The root document.
 * @param {string[]} parts - Path segments.
 * @returns {*} The value at the path.
 * @throws {Error} If the path does not exist.
 */
function getIn(doc, parts) {
  assertSafePath(parts, '/' + parts.join('/'));
  let current = doc;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') {
      throw new Error(`Path not found: part "${part}"`);
    }
    if (!(part in current) && !Array.isArray(current)) {
      throw new Error(`Key "${part}" does not exist`);
    }
    current = current[part];
  }
  return current;
}

/**
 * Sets a nested value in a cloned document, returning the modified clone.
 *
 * @param {*}        doc   - The root document.
 * @param {string[]} parts - Path segments.
 * @param {*}        value - Value to set.
 * @returns {*} Modified document clone.
 */
function setIn(doc, parts, value) {
  assertSafePath(parts, '/' + parts.join('/'));
  if (parts.length === 0) return deepClone(value);
  const clone = deepClone(doc);
  let current = clone;
  for (let i = 0; i < parts.length - 1; i++) {
    current = current[parts[i]];
  }
  const last = parts[parts.length - 1];
  if (Array.isArray(current)) {
    const index = last === '-' ? current.length : parseInt(last, 10);
    current.splice(index, 0, deepClone(value));
  } else {
    current[last] = deepClone(value);
  }
  return clone;
}

/**
 * Removes a nested value from a cloned document.
 *
 * @param {*}        doc   - The root document.
 * @param {string[]} parts - Path segments.
 * @returns {*} Modified document clone.
 */
function removeIn(doc, parts) {
  assertSafePath(parts, '/' + parts.join('/'));
  if (parts.length === 0) throw new Error('Cannot remove the root document');
  const clone = deepClone(doc);
  let current = clone;
  for (let i = 0; i < parts.length - 1; i++) {
    current = current[parts[i]];
  }
  const last = parts[parts.length - 1];
  if (Array.isArray(current)) {
    current.splice(parseInt(last, 10), 1);
  } else {
    delete current[last];
  }
  return clone;
}

/**
 * Applies a single RFC 6902 patch operation to a document.
 *
 * @param {*}      doc - The current document (will be cloned internally).
 * @param {Object} op  - An RFC 6902 operation object.
 * @returns {*} The patched document.
 */
function applyOp(doc, op) {
  const path = parsePath(op.path);
  assertSafePath(path, op.path);

  switch (op.op) {
    case 'add':
      return setIn(doc, path, op.value);

    case 'remove':
      return removeIn(doc, path);

    case 'replace': {
      // Path must exist before replacing
      getIn(doc, path);
      const removed = removeIn(doc, path);
      return setIn(removed, path, op.value);
    }

    case 'copy': {
      const fromParts = parsePath(op.from);
      assertSafePath(fromParts, op.from);
      const srcValue = getIn(doc, fromParts);
      return setIn(doc, path, srcValue);
    }

    case 'move': {
      const fromParts = parsePath(op.from);
      assertSafePath(fromParts, op.from);
      const movedValue = getIn(doc, fromParts);
      const afterRemove = removeIn(doc, fromParts);
      return setIn(afterRemove, path, movedValue);
    }

    case 'test': {
      const actual = JSON.stringify(getIn(doc, path));
      const expected = JSON.stringify(op.value);
      if (actual !== expected) {
        throw new Error(`Test failed at path "${op.path}": expected ${expected}, got ${actual}`);
      }
      return doc;
    }

    default:
      throw new Error(`Unsupported operation: "${op.op}"`);
  }
}

/**
 * Applies an array of RFC 6902 patch operations to a document.
 * Operations are applied sequentially; if any fails, an error is thrown.
 *
 * @param {*}       doc   - The original JSON document (any JSON-compatible value).
 * @param {Object[]} patch - Array of RFC 6902 operation objects.
 * @returns {*} The resulting document after all operations are applied.
 * @throws {Error} If any operation is invalid or fails.
 *
 * @example
 * apply({ a: 1 }, [{ op: 'add', path: '/b', value: 2 }]);
 * // → { a: 1, b: 2 }
 */
export function apply(doc, patch) {
  let result = deepClone(doc);
  for (const op of patch) {
    result = applyOp(result, op);
  }
  return result;
}

/**
 * Generates a minimal RFC 6902 patch array that transforms `original` into `modified`.
 * Uses recursive structural comparison to produce add/remove/replace operations.
 *
 * @param {*} original - The original document.
 * @param {*} modified - The target document.
 * @returns {Object[]} Array of RFC 6902 patch operations.
 *
 * @example
 * diff({ a: 1 }, { a: 2, b: 3 });
 * // → [{ op: 'replace', path: '/a', value: 2 }, { op: 'add', path: '/b', value: 3 }]
 */
export function diff(original, modified) {
  const ops = [];

  function generateDiff(orig, mod, path) {
    if (JSON.stringify(orig) === JSON.stringify(mod)) return;

    const origIsObj = orig !== null && typeof orig === 'object' && !Array.isArray(orig);
    const modIsObj  = mod  !== null && typeof mod  === 'object' && !Array.isArray(mod);

    if (origIsObj && modIsObj) {
      const origKeys = Object.keys(orig);
      const modKeys  = Object.keys(mod);

      // Handle removed keys
      for (const key of origKeys) {
        if (!(key in mod)) {
          ops.push({ op: 'remove', path: `${path}/${key}` });
        }
      }
      // Handle added and changed keys
      for (const key of modKeys) {
        const escapedKey = key.replace(/~/g, '~0').replace(/\//g, '~1');
        if (!(key in orig)) {
          ops.push({ op: 'add', path: `${path}/${escapedKey}`, value: deepClone(mod[key]) });
        } else {
          generateDiff(orig[key], mod[key], `${path}/${escapedKey}`);
        }
      }
    } else {
      ops.push({ op: 'replace', path: path || '/', value: deepClone(mod) });
    }
  }

  generateDiff(original, modified, '');
  return ops;
}

/**
 * Validates an array of patch operations for structural correctness.
 * Does NOT apply the operations — only checks that required fields are present.
 *
 * @param {Object[]} patch - Array of patch operation objects to validate.
 * @returns {{ valid: boolean, errors: string[] }} Validation result.
 *
 * @example
 * validate([{ op: 'add', path: '/x' }]);
 * // → { valid: false, errors: ["Operation at index 0: 'add' requires a 'value' field"] }
 */
export function validate(patch) {
  const errors = [];
  const OPS_REQUIRING_VALUE = new Set(['add', 'replace', 'test']);
  const OPS_REQUIRING_FROM  = new Set(['copy', 'move']);
  const VALID_OPS = new Set(['add', 'remove', 'replace', 'copy', 'move', 'test']);

  if (!Array.isArray(patch)) {
    return { valid: false, errors: ['Patch must be an array'] };
  }

  for (let i = 0; i < patch.length; i++) {
    const op = patch[i];
    const prefix = `Operation at index ${i}`;

    if (!op || typeof op !== 'object') {
      errors.push(`${prefix}: must be an object`);
      continue;
    }
    if (!VALID_OPS.has(op.op)) {
      errors.push(`${prefix}: unknown op "${op.op}"`);
    }
    if (typeof op.path !== 'string') {
      errors.push(`${prefix}: 'path' must be a string`);
    } else {
      try {
        const parts = parsePath(op.path);
        if (parts.some(isUnsafeKey)) {
          errors.push(`${prefix}: 'path' contains unsafe key segment`);
        }
      } catch (err) {
        errors.push(`${prefix}: invalid path "${op.path}"`);
      }
    }
    if (OPS_REQUIRING_VALUE.has(op.op) && !('value' in op)) {
      errors.push(`${prefix}: '${op.op}' requires a 'value' field`);
    }
    if (OPS_REQUIRING_FROM.has(op.op)) {
      if (typeof op.from !== 'string') {
        errors.push(`${prefix}: '${op.op}' requires a 'from' string`);
      } else {
        try {
          const fromParts = parsePath(op.from);
          if (fromParts.some(isUnsafeKey)) {
            errors.push(`${prefix}: 'from' contains unsafe key segment`);
          }
        } catch (err) {
          errors.push(`${prefix}: invalid from path "${op.from}"`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
