export class UrlBuilder {
  /**
   * Builds a URL string by appending query parameters.
   * Supports arrays and nested objects.
   * @param {string} baseUrl - Base URL path
   * @param {Object} [params={}] - Query parameters
   * @returns {string} Fully constructed URL
   */
  static build(baseUrl, params = {}) {
    const queryParts = [];

    const serialize = (obj, prefix) => {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];
          const k = prefix ? `${prefix}[${key}]` : key;

          if (value === null || value === undefined) {
            continue;
          }

          if (typeof value === 'object') {
            serialize(value, k);
          } else {
            queryParts.push(`${encodeURIComponent(k)}=${encodeURIComponent(value)}`);
          }
        }
      }
    };

    serialize(params);

    if (queryParts.length === 0) {
      return baseUrl;
    }

    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${queryParts.join('&')}`;
  }

  /**
   * Parses a query string into a structured object, supporting nested keys.
   * E.g. "filters[role]=admin&tags[]=1&tags[]=2" -> { filters: { role: 'admin' }, tags: ['1', '2'] }
   * @param {string} queryString
   * @returns {Object} Structured query parameters
   */
  static parse(queryString) {
    if (!queryString) return {};

    // Remove leading '?' if present
    const clean = queryString.startsWith('?') ? queryString.slice(1) : queryString;
    const result = {};

    const pairs = clean.split('&');
    for (const pair of pairs) {
      if (!pair) continue;
      const [rawKey, rawValue] = pair.split('=');
      const key = decodeURIComponent(rawKey);
      const val = decodeURIComponent(rawValue || '');

      // Parse nested keys: e.g. "filters[user][name]" or "tags[]"
      const keys = [];
      let temp = '';
      for (let i = 0; i < key.length; i++) {
        const char = key[i];
        if (char === '[') {
          if (temp) {
            keys.push(temp);
            temp = '';
          }
        } else if (char === ']') {
          // Empty brackets indicate array push
          keys.push(temp); // could be empty string
          temp = '';
        } else {
          temp += char;
        }
      }
      if (temp) {
        keys.push(temp);
      }

      // Assign value recursively
      let current = result;
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        const isLast = i === keys.length - 1;

        if (isLast) {
          if (k === '') {
            // Array push
            if (!Array.isArray(current)) {
              // Should not happen if well-formed, but handle gracefully
              break;
            }
            current.push(val);
          } else {
            current[k] = val;
          }
        } else {
          const nextK = keys[i + 1];
          if (nextK === '') {
            // Next is array index
            if (!current[k]) current[k] = [];
            current = current[k];
          } else {
            if (!current[k]) current[k] = {};
            current = current[k];
          }
        }
      }
    }

    return result;
  }
}
