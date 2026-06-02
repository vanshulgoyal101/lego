import http from 'http';
import fs from 'fs';
import path from 'path';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8'
};

export class StaticServer {
  constructor(publicDir, port = 3000) {
    this.publicDir = path.resolve(publicDir);
    this.port = port;
    this.server = null;
  }

  generateETag(stats) {
    return `W/"${stats.size.toString(16)}-${stats.mtime.getTime().toString(16)}"`;
  }

  handleRequest(req, res) {
    // Prevent directory traversal attacks
    let safeSuffix = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
    // Strip query parameters
    safeSuffix = safeSuffix.split('?')[0];

    let filePath = path.join(this.publicDir, safeSuffix);

    // If directory, look for index.html
    fs.stat(filePath, (err, stats) => {
      if (err) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('404 Not Found');
        return;
      }

      if (stats.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
        fs.stat(filePath, (errIndex, statsIndex) => {
          if (errIndex) {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'text/plain');
            res.end('403 Forbidden');
            return;
          }
          this.serveFile(filePath, statsIndex, req, res);
        });
      } else {
        this.serveFile(filePath, stats, req, res);
      }
    });
  }

  serveFile(filePath, stats, req, res) {
    const etag = this.generateETag(stats);
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');

    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch && ifNoneMatch === etag) {
      res.statusCode = 304;
      res.end();
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);

    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('500 Internal Server Error');
      }
    });
    stream.pipe(res);
  }

  start() {
    return new Promise((resolve) => {
      this.server = http.createServer((req, res) => this.handleRequest(req, res));
      this.server.listen(this.port, () => {
        resolve(this.server);
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }
}
