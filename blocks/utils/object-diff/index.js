/**
 * Object Diff Utility
 * Computes structural differences between two nested JavaScript objects.
 * Returns typed change records and supports applying/reversing patches.
 */

/**
 * Deep equality check for primitive and object values.
 */
function deepEqual(a, b) {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!b.hasOwnProperty(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
}

/**
 * Deep clone a value for snapshot storage.
 */
function clone(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(clone);
  const result = {};
  for (const key of Object.keys(value)) result[key] = clone(value[key]);
  return result;
}

/**
 * Compute the diff between two objects.
 * @param {Object} before - Original object.
 * @param {Object} after - Modified object.
 * @param {string} [path=''] - Internal path prefix for nested keys.
 * @returns {Array<Object>} Array of change records.
 */
export function diff(before, after, path = '') {
  const changes = [];

  if (typeof before !== 'object' || typeof after !== 'object' ||
      before === null || after === null ||
      Array.isArray(before) !== Array.isArray(after)) {
    // Scalar replacement at root
    if (!deepEqual(before, after)) {
      changes.push({ type: 'modified', path: path || '.', from: clone(before), to: clone(after) });
    }
    return changes;
  }

  const beforeKeys = new Set(Object.keys(before));
  const afterKeys = new Set(Object.keys(after));

  // Added keys
  for (const key of afterKeys) {
    if (!beforeKeys.has(key)) {
      changes.push({
        type: 'added',
        path: path ? `${path}.${key}` : key,
        value: clone(after[key])
      });
    }
  }

  // Removed keys
  for (const key of beforeKeys) {
    if (!afterKeys.has(key)) {
      changes.push({
        type: 'removed',
        path: path ? `${path}.${key}` : key,
        value: clone(before[key])
      });
    }
  }

  // Modified or recursively diffed keys
  for (const key of beforeKeys) {
    if (!afterKeys.has(key)) continue;
    const keyPath = path ? `${path}.${key}` : key;
    const bVal = before[key];
    const aVal = after[key];

    if (typeof bVal === 'object' && typeof aVal === 'object' &&
        bVal !== null && aVal !== null &&
        !Array.isArray(bVal) && !Array.isArray(aVal)) {
      // Recurse into nested objects
      const nested = diff(bVal, aVal, keyPath);
      changes.push(...nested);
    } else if (!deepEqual(bVal, aVal)) {
      changes.push({
        type: 'modified',
        path: keyPath,
        from: clone(bVal),
        to: clone(aVal)
      });
    }
  }

  return changes;
}

/**
 * Apply a diff patch to a target object, returning a new object with changes applied.
 * @param {Object} target - The original object.
 * @param {Array<Object>} changes - Change records from diff().
 * @returns {Object} Patched object.
 */
export function applyPatch(target, changes) {
  const result = clone(target);

  for (const change of changes) {
    const parts = change.path.split('.').filter(Boolean);

    function setAtPath(obj, pathParts, value) {
      if (pathParts.length === 1) {
        obj[pathParts[0]] = clone(value);
        return;
      }
      if (!obj[pathParts[0]]) obj[pathParts[0]] = {};
      setAtPath(obj[pathParts[0]], pathParts.slice(1), value);
    }

    function deleteAtPath(obj, pathParts) {
      if (pathParts.length === 1) {
        delete obj[pathParts[0]];
        return;
      }
      if (obj[pathParts[0]]) {
        deleteAtPath(obj[pathParts[0]], pathParts.slice(1));
      }
    }

    if (change.type === 'added') {
      setAtPath(result, parts, change.value);
    } else if (change.type === 'removed') {
      deleteAtPath(result, parts);
    } else if (change.type === 'modified') {
      setAtPath(result, parts, change.to);
    }
  }

  return result;
}

/**
 * Reverse a patch (undo changes).
 * @param {Array<Object>} changes - Change records from diff().
 * @returns {Array<Object>} Reversed change records.
 */
export function reversePatch(changes) {
  return changes.map(change => {
    if (change.type === 'added') {
      return { type: 'removed', path: change.path, value: change.value };
    }
    if (change.type === 'removed') {
      return { type: 'added', path: change.path, value: change.value };
    }
    if (change.type === 'modified') {
      return { type: 'modified', path: change.path, from: change.to, to: change.from };
    }
    return change;
  }).reverse();
}

/**
 * Check if two objects are deeply equal (no diff).
 * @param {any} a
 * @param {any} b
 * @returns {boolean}
 */
export { deepEqual };
