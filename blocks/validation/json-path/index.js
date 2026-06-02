/**
 * JSONPath Evaluator
 * A lightweight, zero-dependency JSONPath implementation.
 * Supports dot notation, bracket notation, wildcards (*),
 * array indices, and recursive descent (..).
 *
 * Supported syntax:
 *  $ - root object
 *  .key or ['key'] - child access
 *  [n] - array index access
 *  [*] or .* - wildcard (all children)
 *  .. - recursive descent (deep scan)
 */

/**
 * Tokenize a JSONPath expression into segments.
 * @param {string} path - JSONPath string (must start with '$').
 * @returns {string[]} Array of path segments.
 */
function tokenize(path) {
  if (typeof path !== 'string') throw new TypeError('Path must be a string');
  if (!path.startsWith('$')) throw new Error('JSONPath must start with $');

  const segments = [];
  let rest = path.slice(1); // remove leading '$'

  while (rest.length > 0) {
    // Recursive descent: ..
    if (rest.startsWith('..')) {
      segments.push('..');
      rest = rest.slice(2);
      // Collect following key if present
      const keyMatch = /^([a-zA-Z_$][a-zA-Z0-9_$]*)/.exec(rest);
      if (keyMatch) {
        segments.push(keyMatch[1]);
        rest = rest.slice(keyMatch[1].length);
      }
      continue;
    }

    // Dot notation: .key or .*
    if (rest.startsWith('.')) {
      rest = rest.slice(1);
      if (rest.startsWith('*')) {
        segments.push('*');
        rest = rest.slice(1);
      } else {
        const keyMatch = /^([a-zA-Z_$][a-zA-Z0-9_$]*)/.exec(rest);
        if (keyMatch) {
          segments.push(keyMatch[1]);
          rest = rest.slice(keyMatch[1].length);
        }
      }
      continue;
    }

    // Bracket notation: [key], [n], [*], ['key'], ["key"]
    if (rest.startsWith('[')) {
      const end = rest.indexOf(']');
      if (end === -1) throw new Error(`Unclosed bracket in path: ${path}`);
      let inner = rest.slice(1, end);
      rest = rest.slice(end + 1);
      // Strip quotes
      inner = inner.replace(/^['"]|['"]$/g, '');
      segments.push(inner === '*' ? '*' : inner);
      continue;
    }

    break; // unrecognized character — stop
  }

  return segments;
}

/**
 * Recursively evaluate path segments against an object, collecting results.
 * @param {*} obj - Current node.
 * @param {string[]} segments - Remaining path segments.
 * @param {*[]} results - Accumulator for matched values.
 */
function evaluate(obj, segments, results) {
  if (segments.length === 0) {
    results.push(obj);
    return;
  }

  const [head, ...tail] = segments;

  if (head === '..') {
    // When recursive descent is hit, we want to look for the next segment (the key we actually want to match)
    // anywhere in the subtree. Let's find all occurrences of the subpath matching tail.
    const search = (node) => {
      // Try to evaluate the tail path starting from this node
      evaluate(node, tail, results);
      if (node && typeof node === 'object') {
        for (const key of Object.keys(node)) {
          search(node[key]);
        }
      }
    };
    search(obj);
    return;
  }

  if (head === '*') {
    if (obj && typeof obj === 'object') {
      for (const val of Object.values(obj)) {
        evaluate(val, tail, results);
      }
    }
    return;
  }

  if (obj && typeof obj === 'object') {
    // Numeric index for arrays
    const index = /^\d+$/.test(head) ? parseInt(head, 10) : head;
    if (Object.prototype.hasOwnProperty.call(obj, index)) {
      evaluate(obj[index], tail, results);
    }
  }
}

/**
 * Query a JSON object using a JSONPath expression. Returns all matching values.
 *
 * @param {object} obj - Root JSON object.
 * @param {string} path - JSONPath expression (e.g. '$.store.books[0].title').
 * @returns {*[]} Array of all matching values (may be empty).
 *
 * @example
 * query({ a: { b: 1 } }, '$.a.b')         // [1]
 * query({ items: [1, 2, 3] }, '$.items[*]') // [1, 2, 3]
 * query({ a: { b: { c: 42 } } }, '$..c')   // [42]
 */
export function query(obj, path) {
  const segments = tokenize(path);
  const results = [];
  evaluate(obj, segments, results);
  return results;
}

/**
 * Get the first value matching a JSONPath expression, or undefined if not found.
 *
 * @param {object} obj - Root JSON object.
 * @param {string} path - JSONPath expression.
 * @returns {*} First matching value, or undefined.
 *
 * @example
 * get({ a: [10, 20] }, '$.a[1]') // 20
 * get({ x: 1 }, '$.y')           // undefined
 */
export function get(obj, path) {
  return query(obj, path)[0];
}

/**
 * Set the value at the path in a JSON object (mutates the original object).
 * Only supports simple paths (no wildcards or recursive descent).
 *
 * @param {object} obj - Root JSON object to mutate.
 * @param {string} path - JSONPath expression (simple paths only).
 * @param {*} value - Value to set.
 * @returns {boolean} True if the path was found and value was set.
 *
 * @example
 * const obj = { a: { b: 1 } };
 * set(obj, '$.a.b', 99);    // obj.a.b === 99
 * set(obj, '$.a.c', 'new'); // obj.a.c === 'new'
 */
export function set(obj, path, value) {
  const segments = tokenize(path);
  if (segments.length === 0) return false;

  let current = obj;
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i];
    if (current == null || typeof current !== 'object') return false;
    const key = /^\d+$/.test(seg) ? parseInt(seg, 10) : seg;
    if (!(key in current)) {
      // Auto-create intermediate objects
      current[key] = /^\d+$/.test(String(segments[i + 1])) ? [] : {};
    }
    current = current[key];
  }

  const last = segments[segments.length - 1];
  if (current == null || typeof current !== 'object') return false;
  const lastKey = /^\d+$/.test(last) ? parseInt(last, 10) : last;
  current[lastKey] = value;
  return true;
}

/**
 * Check if a JSONPath expression matches at least one value in the object.
 *
 * @param {object} obj - Root JSON object.
 * @param {string} path - JSONPath expression.
 * @returns {boolean}
 *
 * @example
 * exists({ a: { b: 1 } }, '$.a.b') // true
 * exists({ a: 1 }, '$.b')          // false
 */
export function exists(obj, path) {
  return query(obj, path).length > 0;
}
