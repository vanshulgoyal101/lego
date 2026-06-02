/**
 * A lightweight client-side routing engine.
 * Compiles path patterns (like '/users/:id') to regular expressions
 * to match paths and extract route parameters.
 */
export class ClientRouter {
  constructor() {
    this.routes = [];
  }

  /**
   * Helper to compile pattern to RegExp and param keys list.
   * @private
   */
  _compileRoute(pattern) {
    const keys = [];
    // Replace parameter tokens (e.g. :id) with regex capture groups
    const regexSource = pattern.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
      keys.push(key);
      return '([^/]+)';
    });

    const regex = new RegExp(`^${regexSource}$`);
    return { regex, keys };
  }

  /**
   * Register a route path pattern and handler.
   * @param {string} pattern - Route path pattern (e.g., '/posts/:postId').
   * @param {Function} handler - Action callback to execute on match.
   */
  register(pattern, handler) {
    const { regex, keys } = this._compileRoute(pattern);
    this.routes.push({ pattern, regex, keys, handler });
  }

  /**
   * Match a path against registered routes and run matching handler with params.
   * @param {string} path - The request path (e.g. '/posts/123').
   * @returns {boolean} True if a route matched, false otherwise.
   */
  navigate(path) {
    const cleanPath = path.split('?')[0]; // Strip query params for matching
    
    for (const route of this.routes) {
      const match = cleanPath.match(route.regex);
      if (match) {
        const params = {};
        route.keys.forEach((key, index) => {
          params[key] = decodeURIComponent(match[index + 1]);
        });
        
        route.handler(params);
        return true;
      }
    }
    return false;
  }
}
