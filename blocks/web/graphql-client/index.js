/**
 * Lightweight, zero-dependency GraphQL Client using native fetch API
 */
export class GraphQLClient {
  /**
   * @param {string} url - GraphQL server endpoint
   * @param {Object} [options={}]
   * @param {Object} [options.headers] - HTTP headers (e.g. Authorization)
   */
  constructor(url, options = {}) {
    if (!url) {
      throw new Error('InvalidInput: Endpoint URL is required.');
    }
    this.url = url;
    this.headers = options.headers || {};
  }

  /**
   * Execute raw query/mutation
   *
   * @param {string} query
   * @param {Object} [variables={}]
   * @returns {Promise<Object>} Data returned by GraphQL server
   */
  async request(query, variables = {}) {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.headers
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      throw new Error(`HTTPError: Server responded with status ${response.status}`);
    }

    const body = await response.json();
    if (body.errors && body.errors.length > 0) {
      const err = new Error(body.errors[0].message);
      err.errors = body.errors;
      throw err;
    }

    return body.data;
  }

  /**
   * Send a query request
   */
  query(queryStr, variables = {}) {
    return this.request(queryStr, variables);
  }

  /**
   * Send a mutation request
   */
  mutate(mutationStr, variables = {}) {
    return this.request(mutationStr, variables);
  }
}
