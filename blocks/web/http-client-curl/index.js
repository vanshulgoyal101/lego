export class HttpClientCurl {
  /**
   * Generates a curl command string from request parameters.
   * @param {string} url - Target URL
   * @param {Object} [options={}]
   * @param {string} [options.method='GET'] - HTTP method
   * @param {Object} [options.headers={}] - Key-value headers
   * @param {string|Object} [options.body] - Request body payload
   * @returns {string} The formatted curl command line
   */
  static toCurl(url, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const headers = options.headers || {};
    let body = options.body;

    const parts = ['curl'];

    if (method !== 'GET') {
      parts.push(`-X ${method}`);
    }

    // Add headers
    for (const [k, v] of Object.entries(headers)) {
      // Escape double quotes inside headers
      const escapedVal = String(v).replace(/"/g, '\\"');
      parts.push(`-H "${k}: ${escapedVal}"`);
    }

    // Add body
    if (body !== undefined && body !== null) {
      let bodyStr;
      if (typeof body === 'object') {
        bodyStr = JSON.stringify(body);
        if (!headers['Content-Type'] && !headers['content-type']) {
          // Add default content-type header to parts if JSON object is passed
          parts.splice(method === 'GET' ? 1 : 2, 0, '-H "Content-Type: application/json"');
        }
      } else {
        bodyStr = String(body);
      }

      // Escape single quotes inside single-quoted body, or double-quotes inside double-quoted body.
      // Standard: curl -d 'body' where any single quote ' is replaced by '\''
      const escapedBody = bodyStr.replace(/'/g, "'\\''");
      parts.push(`-d '${escapedBody}'`);
    }

    parts.push(`"${url}"`);

    return parts.join(' ');
  }
}
