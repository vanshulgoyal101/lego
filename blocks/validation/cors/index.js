/**
 * Rules-based Cross-Origin Resource Sharing (CORS) Policy Validator.
 */

function originMatches(origin, allowed) {
  if (allowed === '*') return true;
  if (typeof allowed === 'string') {
    if (allowed.startsWith('*.')) {
      // Subdomain wildcard matching: *.example.com matches api.example.com
      const suffix = allowed.substring(1);
      return origin.endsWith(suffix);
    }
    return origin === allowed;
  }
  if (allowed instanceof RegExp) {
    return allowed.test(origin);
  }
  return false;
}

/**
 * Validates a request origin against a CORS policy.
 *
 * @param {string} requestOrigin - The client request origin
 * @param {object} policy - CORS policy rules
 * @param {string|string[]|RegExp} [policy.allowedOrigins="*"] - Allowed origins
 * @param {boolean} [policy.allowCredentials=false] - Supports credential cookies
 * @param {string[]} [policy.exposedHeaders] - Headers exposed to the browser
 * @returns {{ isAllowed: boolean, headers: Record<string, string> }} Response headers
 */
export function validate(requestOrigin, policy = {}) {
  if (!requestOrigin) {
    return { isAllowed: true, headers: {} }; // Non-CORS request
  }

  const allowedOrigins = policy.allowedOrigins !== undefined ? policy.allowedOrigins : '*';
  let matchedOrigin = null;

  if (Array.isArray(allowedOrigins)) {
    for (const allowed of allowedOrigins) {
      if (originMatches(requestOrigin, allowed)) {
        matchedOrigin = requestOrigin;
        break;
      }
    }
  } else if (originMatches(requestOrigin, allowedOrigins)) {
    matchedOrigin = (allowedOrigins === '*' && !policy.allowCredentials) ? '*' : requestOrigin;
  }

  const isAllowed = matchedOrigin !== null;
  const headers = {};

  if (isAllowed) {
    headers['Access-Control-Allow-Origin'] = matchedOrigin;
    if (policy.allowCredentials) {
      headers['Access-Control-Allow-Credentials'] = 'true';
    }
    if (policy.exposedHeaders && Array.isArray(policy.exposedHeaders)) {
      headers['Access-Control-Expose-Headers'] = policy.exposedHeaders.join(', ');
    }
  }

  return { isAllowed, headers };
}

/**
 * Handles CORS preflight verification.
 *
 * @param {string} requestOrigin - Client request origin
 * @param {string} requestMethod - Client request method
 * @param {string} requestHeadersStr - Request headers requested (comma-separated)
 * @param {object} policy - CORS policy rules
 * @returns {{ isAllowed: boolean, headers: Record<string, string> }} Response headers
 */
export function handlePreflight(requestOrigin, requestMethod, requestHeadersStr = '', policy = {}) {
  const { isAllowed, headers } = validate(requestOrigin, policy);
  if (!isAllowed) {
    return { isAllowed: false, headers: {} };
  }

  // Check allowed methods
  const allowedMethods = policy.allowedMethods !== undefined ? policy.allowedMethods : ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'];
  let isMethodAllowed = false;

  if (allowedMethods === '*') {
    isMethodAllowed = true;
  } else if (Array.isArray(allowedMethods)) {
    isMethodAllowed = allowedMethods.map(m => m.toUpperCase()).includes(requestMethod.toUpperCase());
  }

  if (!isMethodAllowed) {
    return { isAllowed: false, headers: {} };
  }

  // Check allowed headers
  const allowedHeaders = policy.allowedHeaders !== undefined ? policy.allowedHeaders : '*';
  let areHeadersAllowed = true;

  if (allowedHeaders !== '*' && requestHeadersStr) {
    const requested = requestHeadersStr.split(',').map(h => h.trim().toLowerCase());
    const allowed = Array.isArray(allowedHeaders) ? allowedHeaders.map(h => h.toLowerCase()) : [];
    areHeadersAllowed = requested.every(h => allowed.includes(h));
  }

  if (!areHeadersAllowed) {
    return { isAllowed: false, headers: {} };
  }

  // Set preflight response headers
  headers['Access-Control-Allow-Methods'] = Array.isArray(allowedMethods) ? allowedMethods.join(', ') : allowedMethods;
  headers['Access-Control-Allow-Headers'] = Array.isArray(allowedHeaders) ? allowedHeaders.join(', ') : allowedHeaders;

  if (policy.maxAge !== undefined) {
    headers['Access-Control-Max-Age'] = String(policy.maxAge);
  }

  return { isAllowed: true, headers };
}

export default {
  validate,
  handlePreflight
};
