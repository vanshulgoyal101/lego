import crypto from 'crypto';

/**
 * Cookie-based Signed Session Manager
 */
export class SessionManager {
  /**
   * @param {string} secret - Secret key used for signing session ID
   * @param {Object} [options] - Cookie options config
   */
  constructor(secret, options = {}) {
    if (!secret) throw new Error('Secret is required to initialize SessionManager');
    this.secret = secret;
    this.cookieName = options.cookieName || 'session_id';
    this.maxAge = options.maxAge || 86400; // 24 hours in seconds
    this.sessions = new Map(); // optional store if in-memory session mapping is preferred
  }

  /**
   * Generates a signed session cookie value
   *
   * @param {string} sessionId
   * @returns {string} Signed string value
   */
  sign(sessionId) {
    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(sessionId)
      .digest('base64url');
    return `${sessionId}.${signature}`;
  }

  /**
   * Verifies and unsigns a cookie value
   *
   * @param {string} cookieVal - Value read from client request
   * @returns {string|null} Original session ID, or null if tampered/invalid
   */
  unsign(cookieVal) {
    if (typeof cookieVal !== 'string') return null;
    const parts = cookieVal.split('.');
    if (parts.length !== 2) return null;

    const [sessionId, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', this.secret)
      .update(sessionId)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expectedBuf.length) {
      return null;
    }

    if (crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return sessionId;
    }
    return null;
  }

  /**
   * Generates Set-Cookie header string
   *
   * @param {string} sessionId
   * @returns {string} Cookie header
   */
  getCookieHeader(sessionId) {
    const val = this.sign(sessionId);
    let header = `${this.cookieName}=${val}; Max-Age=${this.maxAge}; HttpOnly; Path=/; SameSite=Lax`;
    return header;
  }
}
