/**
 * URL Validator
 * Validates URLs with fine-grained options for protocol, TLD, localhost, etc.
 */

/**
 * @typedef {Object} UrlValidationOptions
 * @property {boolean} [requireHttps=false] - If true, only https:// URLs are accepted.
 * @property {boolean} [allowLocalhost=false] - If true, localhost and 127.x.x.x hostnames are allowed.
 * @property {string[]} [allowedProtocols] - Explicit list of allowed protocols (e.g. ['https', 'ftp']). Overrides requireHttps if set.
 * @property {boolean} [requireTLD=true] - If true, domain must have a top-level domain (e.g. .com). Default true.
 */

/**
 * @typedef {Object} UrlValidationResult
 * @property {boolean} valid - Whether the URL is valid.
 * @property {string} [error] - Human-readable error if invalid.
 */

const DEFAULT_OPTIONS = {
  requireHttps: false,
  allowLocalhost: false,
  allowedProtocols: null,
  requireTLD: true,
};

/** Localhost patterns */
const LOCALHOST_PATTERNS = /^(localhost|127\.\d{1,3}\.\d{1,3}\.\d{1,3}|::1)$/i;

/** Basic TLD pattern: at least 2 alpha chars */
const TLD_PATTERN = /\.[a-zA-Z]{2,}$/;

/**
 * Validates a URL string against configurable rules.
 *
 * @param {string} str - The URL string to validate.
 * @param {UrlValidationOptions} [options={}] - Validation options.
 * @returns {UrlValidationResult} Result object with `valid` and optional `error`.
 *
 * @example
 * isValidUrl('https://example.com') // { valid: true }
 * isValidUrl('http://example.com', { requireHttps: true }) // { valid: false, error: '...' }
 * isValidUrl('http://localhost:3000', { allowLocalhost: true }) // { valid: true }
 */
export function isValidUrl(str, options = {}) {
  if (typeof str !== 'string' || str.trim() === '') {
    return { valid: false, error: 'URL must be a non-empty string' };
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };

  let parsed;
  try {
    parsed = new URL(str);
  } catch {
    return { valid: false, error: 'URL is not parseable — invalid syntax' };
  }

  const protocol = parsed.protocol.replace(/:$/, ''); // strip trailing colon
  const hostname = parsed.hostname;

  // Protocol validation
  if (opts.allowedProtocols && opts.allowedProtocols.length > 0) {
    if (!opts.allowedProtocols.includes(protocol)) {
      return {
        valid: false,
        error: `Protocol "${protocol}" is not in allowed list: ${opts.allowedProtocols.join(', ')}`,
      };
    }
  } else if (opts.requireHttps) {
    if (protocol !== 'https') {
      return { valid: false, error: `Only HTTPS URLs are allowed; got "${protocol}"` };
    }
  }

  // Localhost check
  const isLocalhost = LOCALHOST_PATTERNS.test(hostname);
  if (isLocalhost && !opts.allowLocalhost) {
    return { valid: false, error: 'Localhost URLs are not allowed' };
  }

  // TLD check (skip for IP addresses and localhost)
  if (opts.requireTLD && !isLocalhost) {
    // Skip TLD check for IP addresses (IPv4 and IPv6)
    const isIPv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
    const isIPv6 = hostname.startsWith('[') && hostname.endsWith(']');
    if (!isIPv4 && !isIPv6 && !TLD_PATTERN.test(hostname)) {
      return { valid: false, error: `Hostname "${hostname}" has no valid TLD` };
    }
  }

  // Hostname must not be empty
  if (!hostname) {
    return { valid: false, error: 'URL has no hostname' };
  }

  return { valid: true };
}

/**
 * Returns true if the URL is valid, false otherwise. Convenience wrapper.
 *
 * @param {string} str - URL to check.
 * @param {UrlValidationOptions} [options={}] - Validation options.
 * @returns {boolean}
 */
export function isUrl(str, options = {}) {
  return isValidUrl(str, options).valid;
}

/**
 * Parses a URL and returns structured components if valid.
 *
 * @param {string} str - URL string to parse.
 * @returns {{ protocol: string, hostname: string, port: string, pathname: string, search: string, hash: string } | null}
 */
export function parseUrl(str) {
  try {
    const u = new URL(str);
    return {
      protocol: u.protocol.replace(/:$/, ''),
      hostname: u.hostname,
      port: u.port,
      pathname: u.pathname,
      search: u.search,
      hash: u.hash,
    };
  } catch {
    return null;
  }
}
