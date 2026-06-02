/**
 * Universal, zero-dependency OAuth 2.0 / OpenID Connect client.
 * Features Authorization Code Flow with PKCE (Proof Key for Code Exchange)
 * using standard cross-runtime Web Crypto APIs.
 */

// Helper to base64url encode buffers
function base64url(buf) {
  const binary = String.fromCharCode(...new Uint8Array(buf));
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * OAuth2 Client helper class.
 */
export class Oauth2Client {
  constructor(config = {}) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret || null;
    this.authEndpoint = config.authEndpoint;
    this.tokenEndpoint = config.tokenEndpoint;
  }

  /**
   * Generates a secure PKCE verifier and challenge pair.
   * Works on Browser, Node, Deno, Bun.
   */
  async generatePkcePairs() {
    const cryptoInstance = typeof crypto !== 'undefined' ? crypto : (await import('crypto')).webcrypto;
    
    // 1. Generate 32 random bytes codeVerifier
    const bytes = new Uint8Array(32);
    cryptoInstance.getRandomValues(bytes);
    const codeVerifier = base64url(bytes);

    // 2. Hash codeVerifier using SHA-256 to create codeChallenge
    const encoder = new TextEncoder();
    const hash = await cryptoInstance.subtle.digest('SHA-256', encoder.encode(codeVerifier));
    const codeChallenge = base64url(hash);

    return {
      codeVerifier,
      codeChallenge
    };
  }

  /**
   * Generates authorization URL redirect path.
   */
  getAuthorizationUrl(options = {}) {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: options.redirectUri,
      scope: options.scope || 'openid profile email',
      state: options.state || ''
    });

    if (options.codeChallenge) {
      params.set('code_challenge', options.codeChallenge);
      params.set('code_challenge_method', 'S256');
    }

    return `${this.authEndpoint}?${params.toString()}`;
  }

  /**
   * Exchanges authorization code for Token Payload.
   */
  async exchangeCodeForToken(code, options = {}) {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: options.redirectUri,
      client_id: this.clientId
    });

    if (options.codeVerifier) {
      body.set('code_verifier', options.codeVerifier);
    }

    if (this.clientSecret) {
      body.set('client_secret', this.clientSecret);
    }

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers,
      body: body.toString()
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`TokenExchangeError: ${response.status} - ${errText}`);
    }

    return response.json();
  }

  /**
   * Refreshes access tokens using a refresh token.
   */
  async refreshAccessToken(refreshToken, options = {}) {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.clientId
    });

    if (this.clientSecret) {
      body.set('client_secret', this.clientSecret);
    }

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers,
      body: body.toString()
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`TokenRefreshError: ${response.status} - ${errText}`);
    }

    return response.json();
  }
}
