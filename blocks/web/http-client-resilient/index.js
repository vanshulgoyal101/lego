/**
 * Advanced, fault-tolerant resilient HTTP client.
 * Implements: Circuit Breaker pattern, Local TTL Cache, Exponential Retry Backoff,
 * and Request/Response Interceptors.
 */

export class HttpClient {
  constructor(config = {}) {
    this.interceptors = {
      request: [],
      response: []
    };

    // Cache configuration
    this.cache = new Map(); // key -> { data, expiresAt }
    this.defaultCacheTtl = config.defaultCacheTtl || 0; // 0 = disabled

    // Circuit Breaker state
    this.cbState = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.failureThreshold = config.failureThreshold || 5;
    this.recoveryTimeout = config.recoveryTimeout || 10000; // time in ms to switch OPEN -> HALF_OPEN
    this.lastStateChange = Date.now();

    // Retry settings
    this.defaultRetries = config.defaultRetries || 3;
    this.retryDelay = config.retryDelay || 100;
  }

  addRequestInterceptor(fn) {
    this.interceptors.request.push(fn);
  }

  addResponseInterceptor(fn) {
    this.interceptors.response.push(fn);
  }

  async request(url, options = {}) {
    // 1. Check Circuit Breaker
    this._evaluateCircuitState();
    if (this.cbState === 'OPEN') {
      throw new Error(`CircuitBreakerError: Circuit is OPEN. Fast failing request to: ${url}`);
    }

    // 2. Build configuration
    let reqOptions = {
      method: 'GET',
      headers: {},
      ...options
    };

    // 3. Run Request Interceptors
    for (const interceptor of this.interceptors.request) {
      const result = await interceptor(url, reqOptions);
      if (result) {
        reqOptions = result.options || reqOptions;
        url = result.url || url;
      }
    }

    // 4. Cache check (GET requests only)
    const isGet = reqOptions.method.toUpperCase() === 'GET';
    const cacheTtl = options.cacheTtl !== undefined ? options.cacheTtl : this.defaultCacheTtl;
    const cacheKey = `${reqOptions.method}:${url}:${JSON.stringify(reqOptions.headers)}`;

    if (isGet && cacheTtl > 0) {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
      }
    }

    // 5. Execute Request with Retry & Circuit logic
    const retries = options.retries !== undefined ? options.retries : this.defaultRetries;
    let attempt = 0;
    let lastError = null;

    while (attempt <= retries) {
      try {
        const response = await fetch(url, reqOptions);

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
        }

        const data = await this._parseResponse(response);

        // Success: report to circuit breaker
        this._recordSuccess();

        // Write cache
        if (isGet && cacheTtl > 0) {
          this.cache.set(cacheKey, { data, expiresAt: Date.now() + cacheTtl });
        }

        // Run Response Interceptors
        let finalData = data;
        for (const interceptor of this.interceptors.response) {
          finalData = await interceptor(finalData, response);
        }

        return finalData;
      } catch (err) {
        lastError = err;
        this._recordFailure();
        attempt++;

        if (attempt <= retries && this.cbState !== 'OPEN') {
          // Delay before next attempt (exponential backoff)
          const delay = this.retryDelay * Math.pow(2, attempt - 1) * (0.8 + Math.random() * 0.4);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          break;
        }
      }
    }

    throw lastError;
  }

  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  async post(url, body, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: typeof body === 'object' ? JSON.stringify(body) : body,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
  }

  _evaluateCircuitState() {
    if (this.cbState === 'OPEN') {
      const elapsed = Date.now() - this.lastStateChange;
      if (elapsed > this.recoveryTimeout) {
        this.cbState = 'HALF_OPEN';
        this.lastStateChange = Date.now();
      }
    }
  }

  _recordSuccess() {
    if (this.cbState === 'HALF_OPEN') {
      this.cbState = 'CLOSED';
      this.failureCount = 0;
      this.lastStateChange = Date.now();
    }
  }

  _recordFailure() {
    this.failureCount++;
    if (this.cbState === 'CLOSED' && this.failureCount >= this.failureThreshold) {
      this.cbState = 'OPEN';
      this.lastStateChange = Date.now();
    } else if (this.cbState === 'HALF_OPEN') {
      // Re-trip circuit immediately
      this.cbState = 'OPEN';
      this.lastStateChange = Date.now();
    }
  }

  async _parseResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
  }
}
