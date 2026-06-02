/**
 * A browser cookie helper for safely reading, writing, and deleting cookies.
 */

/**
 * Set a cookie.
 * @param {string} name - Cookie name.
 * @param {string} value - Cookie value.
 * @param {Object} [options={}] - Cookie options.
 * @param {number} [options.days] - Expiry in days.
 * @param {string} [options.path="/"] - Valid path.
 * @param {string} [options.domain] - Allowed domain scope.
 * @param {boolean} [options.secure=false] - Transmit only over HTTPS.
 * @param {string} [options.sameSite="Lax"] - SameSite attribute (Lax, Strict, None).
 */
export function setCookie(name, value, options = {}) {
  const {
    days,
    path = '/',
    domain,
    secure = false,
    sameSite = 'Lax'
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    cookieString += `; expires=${date.toUTCString()}`;
  }

  cookieString += `; path=${path}`;

  if (domain) {
    cookieString += `; domain=${domain}`;
  }
  if (secure) {
    cookieString += '; secure';
  }
  if (sameSite) {
    cookieString += `; samesite=${sameSite}`;
  }

  if (typeof document !== 'undefined') {
    document.cookie = cookieString;
  }
}

/**
 * Read a cookie by name.
 * @param {string} name - Name of the cookie.
 * @returns {string|null} Cookie value or null if not found.
 */
export function getCookie(name) {
  if (typeof document === 'undefined') {
    return null;
  }

  const nameEQ = `${encodeURIComponent(name)}=`;
  const ca = document.cookie.split(';');

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }

  return null;
}

/**
 * Delete a cookie.
 * @param {string} name - Name of the cookie to remove.
 * @param {string} [path="/"] - Path configured when set.
 * @param {string} [domain] - Domain configured when set.
 */
export function deleteCookie(name, path = '/', domain) {
  setCookie(name, '', { days: -1, path, domain });
}
