import http from 'http';
import { URL } from 'url';

export class LoadBalancer {
  /**
   * @param {Object} options
   * @param {string[]} options.targets - Array of target URLs (e.g. ['http://localhost:8081', 'http://localhost:8082'])
   * @param {'round-robin'|'random'|'least-connections'} [options.policy='round-robin'] - Load balancing policy
   * @param {Object} [options.healthCheck]
   * @param {string} [options.healthCheck.path='/health'] - Health check endpoint path
   * @param {number} [options.healthCheck.interval=5000] - Interval in ms
   * @param {number} [options.healthCheck.timeout=2000] - Timeout in ms
   */
  constructor(options = {}) {
    this.targets = options.targets || [];
    this.policy = options.policy || 'round-robin';
    this.healthCheckOptions = options.healthCheck || null;

    this.connections = new Map();
    this.healthy = new Map();
    this.rrIndex = 0;
    this.healthIntervalId = null;
    this.server = null;

    this.targets.forEach(target => {
      this.connections.set(target, 0);
      this.healthy.set(target, true); // Assume healthy initially
    });

    if (this.healthCheckOptions) {
      this.startHealthChecks();
    }
  }

  selectTarget() {
    const activeTargets = this.targets.filter(t => this.healthy.get(t));
    if (activeTargets.length === 0) {
      return null;
    }

    if (this.policy === 'random') {
      const idx = Math.floor(Math.random() * activeTargets.length);
      return activeTargets[idx];
    }

    if (this.policy === 'least-connections') {
      let minConns = Infinity;
      let selected = activeTargets[0];
      for (const target of activeTargets) {
        const conns = this.connections.get(target) || 0;
        if (conns < minConns) {
          minConns = conns;
          selected = target;
        }
      }
      return selected;
    }

    // Default: 'round-robin'
    const selected = activeTargets[this.rrIndex % activeTargets.length];
    this.rrIndex = (this.rrIndex + 1) % activeTargets.length;
    return selected;
  }

  handle(req, res, next) {
    const target = this.selectTarget();
    if (!target) {
      res.writeHead(503, { 'Content-Type': 'text/plain' });
      res.end('Service Unavailable: No healthy backend targets found');
      return;
    }

    this.connections.set(target, (this.connections.get(target) || 0) + 1);

    const targetUrl = new URL(target);
    const options = {
      hostname: targetUrl.hostname,
      port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
      path: req.url,
      method: req.method,
      headers: { ...req.headers }
    };

    options.headers['host'] = targetUrl.host;

    const cleanup = () => {
      const current = this.connections.get(target) || 1;
      this.connections.set(target, Math.max(0, current - 1));
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
      proxyRes.on('end', cleanup);
      proxyRes.on('close', cleanup);
    });

    proxyReq.on('error', (err) => {
      cleanup();
      if (next) {
        next(err);
      } else {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end(`Bad Gateway: ${err.message}`);
      }
    });

    req.pipe(proxyReq);
  }

  startHealthChecks() {
    const path = this.healthCheckOptions.path || '/health';
    const interval = this.healthCheckOptions.interval || 5000;
    const timeout = this.healthCheckOptions.timeout || 2000;

    const check = () => {
      this.targets.forEach(target => {
        const targetUrl = new URL(target);
        const options = {
          hostname: targetUrl.hostname,
          port: targetUrl.port || 80,
          path: path,
          method: 'GET',
          timeout: timeout
        };

        const req = http.request(options, (res) => {
          const isHealthy = res.statusCode >= 200 && res.statusCode < 400;
          this.healthy.set(target, isHealthy);
          res.resume(); // consume response
        });

        req.on('error', () => {
          this.healthy.set(target, false);
        });

        req.on('timeout', () => {
          this.healthy.set(target, false);
          req.destroy();
        });

        req.end();
      });
    };

    // Run immediately and then on interval
    check();
    this.healthIntervalId = setInterval(check, interval);
  }

  stopHealthChecks() {
    if (this.healthIntervalId) {
      clearInterval(this.healthIntervalId);
      this.healthIntervalId = null;
    }
  }

  listen(port, callback) {
    this.server = http.createServer((req, res) => {
      this.handle(req, res);
    });
    this.server.listen(port, callback);
    return this;
  }

  close(callback) {
    this.stopHealthChecks();
    if (this.server) {
      this.server.close(callback);
    }
  }
}
