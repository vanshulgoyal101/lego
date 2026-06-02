export class CorsMiddleware {
  constructor(options = {}) {
    this.options = {
      origin: options.origin !== undefined ? options.origin : '*',
      methods: options.methods || ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
      allowedHeaders: options.allowedHeaders || [],
      exposedHeaders: options.exposedHeaders || [],
      credentials: options.credentials || false,
      maxAge: options.maxAge || null
    };
  }

  isOriginAllowed(origin) {
    const config = this.options.origin;

    if (config === '*') {
      return true;
    }
    if (typeof config === 'string') {
      return config === origin;
    }
    if (config instanceof RegExp) {
      return config.test(origin);
    }
    if (Array.isArray(config)) {
      return config.includes(origin);
    }
    if (typeof config === 'function') {
      return config(origin);
    }
    return false;
  }

  handle(req, res, next = () => {}) {
    const requestOrigin = req.headers['origin'];

    if (!requestOrigin) {
      return next();
    }

    const allowed = this.isOriginAllowed(requestOrigin);

    if (allowed) {
      // Dynamic origin header when credentials are true, otherwise output origin configuration
      if (this.options.credentials) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      } else {
        res.setHeader('Access-Control-Allow-Origin', this.options.origin === '*' ? '*' : requestOrigin);
      }
    } else {
      // Origin is explicitly blacklisted or mismatched
      return next();
    }

    // Exposed headers
    if (this.options.exposedHeaders.length > 0) {
      res.setHeader('Access-Control-Expose-Headers', this.options.exposedHeaders.join(', '));
    }

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      // Methods
      if (this.options.methods.length > 0) {
        res.setHeader('Access-Control-Allow-Methods', this.options.methods.join(', '));
      }

      // Allowed headers
      const requestHeaders = req.headers['access-control-request-headers'];
      if (this.options.allowedHeaders.length > 0) {
        res.setHeader('Access-Control-Allow-Headers', this.options.allowedHeaders.join(', '));
      } else if (requestHeaders) {
        res.setHeader('Access-Control-Allow-Headers', requestHeaders);
      }

      // Max age
      if (this.options.maxAge !== null) {
        res.setHeader('Access-Control-Max-Age', String(this.options.maxAge));
      }

      res.statusCode = 204;
      res.setHeader('Content-Length', '0');
      res.end();
      return;
    }

    next();
  }
}
