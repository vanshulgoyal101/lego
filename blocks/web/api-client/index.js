/**
 * An advanced HTTP/REST API client wrapper around the standard `fetch` API.
 * Supports configurable baseURL, authorization headers, response type mapping,
 * and middleware-like request and response interceptors.
 */
export class ApiClient {
  /**
   * @param {Object} [config={}] - Base configuration options.
   * @param {string} [config.baseURL=""] - Base endpoint URL.
   * @param {Object} [config.headers={}] - Default request headers.
   * @param {Object} [config.options={}] - Additional default fetch options.
   */
  constructor(config = {}) {
    this.baseURL = config.baseURL || '';
    this.defaultHeaders = config.headers || {};
    this.defaultOptions = config.options || {};
    
    // Interceptor registration maps
    this.interceptors = {
      request: [],
      response: []
    };
  }

  /**
   * Add a request interceptor.
   * @param {Function} onFulfilled - Called with (options). Must return modified options or Promise resolving options.
   * @returns {number} ID to allow ejecting interceptor.
   */
  addRequestInterceptor(onFulfilled) {
    this.interceptors.request.push(onFulfilled);
    return this.interceptors.request.length - 1;
  }

  /**
   * Add a response interceptor.
   * @param {Function} onFulfilled - Called with (response). Must return modified response or data.
   * @param {Function} [onRejected] - Called with (error). Must throw or resolve alternative value.
   * @returns {number} ID to allow ejecting interceptor.
   */
  addResponseInterceptor(onFulfilled, onRejected = null) {
    this.interceptors.response.push({ onFulfilled, onRejected });
    return this.interceptors.response.length - 1;
  }

  /**
   * Performs an HTTP request.
   * @param {string} url - Destination endpoint (appended to baseURL if relative).
   * @param {Object} [options={}] - Standard fetch options plus custom helper keys.
   * @returns {Promise<*>} Resolved payload or native Response depending on interceptors.
   */
  async request(url, options = {}) {
    let targetURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    // Merge headers and options
    let requestOptions = {
      ...this.defaultOptions,
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...(options.headers || {})
      }
    };

    // 1. Run Request Interceptors
    for (const interceptor of this.interceptors.request) {
      requestOptions = await interceptor(requestOptions);
    }

    try {
      let response = await fetch(targetURL, requestOptions);

      // 2. Run Response Interceptors (success chain)
      for (const { onFulfilled } of this.interceptors.response) {
        if (onFulfilled) {
          response = await onFulfilled(response);
        }
      }

      return response;
    } catch (error) {
      // 3. Run Response Interceptors (error chain)
      let handledError = error;
      for (const { onRejected } of this.interceptors.response) {
        if (onRejected) {
          try {
            return await onRejected(handledError);
          } catch (nextError) {
            handledError = nextError;
          }
        }
      }
      throw handledError;
    }
  }

  /**
   * Perform GET request.
   */
  get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  /**
   * Perform POST request.
   */
  post(url, data, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    return this.request(url, {
      ...options,
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
  }

  /**
   * Perform PUT request.
   */
  put(url, data, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    return this.request(url, {
      ...options,
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });
  }

  /**
   * Perform DELETE request.
   */
  delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }
}
