import http from 'http';
import { URL } from 'url';

export class ReverseProxy {
  /**
   * @param {Object} options
   * @param {string} options.target - Target URL (e.g. 'http://localhost:8081')
   */
  constructor(options = {}) {
    this.target = options.target;
    this.server = null;
  }

  /**
   * Handle/Proxy an incoming HTTP request.
   * Useful when embedding into an existing Node.js HTTP server.
   */
  handle(req, res, next) {
    if (!this.target) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('No proxy target configured');
      return;
    }

    try {
      const targetUrl = new URL(this.target);
      
      const options = {
        hostname: targetUrl.hostname,
        port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
        path: req.url,
        method: req.method,
        headers: { ...req.headers }
      };

      // Set/Override the Host header to match target
      options.headers['host'] = targetUrl.host;

      // Add x-forwarded-for header
      const clientIp = req.socket.remoteAddress;
      if (clientIp) {
        if (options.headers['x-forwarded-for']) {
          options.headers['x-forwarded-for'] += `, ${clientIp}`;
        } else {
          options.headers['x-forwarded-for'] = clientIp;
        }
      }

      const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      });

      proxyReq.on('error', (err) => {
        if (next) {
          next(err);
        } else {
          res.writeHead(502, { 'Content-Type': 'text/plain' });
          res.end(`Bad Gateway: ${err.message}`);
        }
      });

      req.pipe(proxyReq);
    } catch (err) {
      if (next) {
        next(err);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Proxy initialization error: ${err.message}`);
      }
    }
  }

  /**
   * Start a standalone reverse proxy server.
   */
  listen(port, callback) {
    this.server = http.createServer((req, res) => {
      this.handle(req, res);
    });
    this.server.listen(port, callback);
    return this;
  }

  close(callback) {
    if (this.server) {
      this.server.close(callback);
    }
  }
}
