/**
 * A lightweight URL query parameters codec.
 * Parses query strings and stringifies objects to valid URL-safe string blocks.
 * Safely handles arrays and nested keys.
 */

/**
 * Stringifies an object of parameters into a query string.
 * @param {Object} obj - The parameters map object.
 * @returns {string} Query string format (e.g., 'a=1&b=2').
 */
export function stringifyQuery(obj) {
  if (!obj || typeof obj !== 'object') return '';
  const parts = [];

  const serialize = (key, value) => {
    if (value === null || value === undefined) return;

    if (Array.isArray(value)) {
      value.forEach(val => {
        parts.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(val)}`);
      });
    } else if (typeof value === 'object') {
      Object.entries(value).forEach(([subKey, subVal]) => {
        serialize(`${key}[${subKey}]`, subVal);
      });
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  };

  Object.entries(obj).forEach(([key, value]) => {
    serialize(key, value);
  });

  return parts.join('&');
}

/**
 * Parses a query string into a structured parameters object.
 * @param {string} queryString - The raw query string (e.g. '?a=1&tags[]=admin&tags[]=user').
 * @returns {Object} Parameters tree.
 */
export function parseQuery(queryString) {
  const query = queryString.startsWith('?') ? queryString.substring(1) : queryString;
  const result = Object.create(null);
  if (!query) return result;

  const isUnsafeKey = (key) => key === '__proto__' || key === 'prototype' || key === 'constructor';

  const pairs = query.split('&');
  for (const pair of pairs) {
    if (!pair) continue;
    const eqIdx = pair.indexOf('=');
    const rawKey = eqIdx === -1 ? pair : pair.slice(0, eqIdx);
    const rawVal = eqIdx === -1 ? '' : pair.slice(eqIdx + 1);
    const key = decodeURIComponent(rawKey);
    const value = decodeURIComponent(rawVal);

    // Handle nested array syntax (e.g. key[])
    if (key.endsWith('[]')) {
      const cleanKey = key.slice(0, -2);
      if (isUnsafeKey(cleanKey)) continue;
      if (!Array.isArray(result[cleanKey])) {
        result[cleanKey] = [];
      }
      result[cleanKey].push(value);
    } else if (key.includes('[') && key.endsWith(']')) {
      // Handle nested object syntax (e.g. parent[child])
      const parent = key.substring(0, key.indexOf('['));
      const child = key.substring(key.indexOf('[') + 1, key.length - 1);
      if (isUnsafeKey(parent) || isUnsafeKey(child)) continue;
      
      if (
        typeof result[parent] !== 'object' ||
        result[parent] === null ||
        Array.isArray(result[parent])
      ) {
        result[parent] = Object.create(null);
      }
      result[parent][child] = value;
    } else {
      if (isUnsafeKey(key)) continue;
      result[key] = value;
    }
  }

  return result;
}
