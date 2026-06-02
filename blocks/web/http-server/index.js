/**
 * Zero-Dependency HTTP/1.1 TCP Web Server.
 * Features:
 * 1. Raw HTTP request parser (headers, status line, query parameters, bodies).
 * 2. Route matcher supporting path parameters (e.g. /users/:id).
 * 3. Middleware execution stack handler pipeline (next()).
 * 4. Request / Response abstraction wrapper objects.
 * 5. Cookies setting and parsing helpers.
 * 6. Static files and JSON body serializers.
 */

import net from 'net';

class Request {
  constructor(socket) {
    this.socket = socket;
    this.method = '';
    this.path = '';
    this.url = '';
    this.headers = {};
    this.query = {};
    this.params = {};
    this.body = null;
    this.rawBody = Buffer.alloc(0);
    this.cookies = {};
  }
}

class Response {
  constructor(socket) {
    this.socket = socket;
    this.statusCode = 200;
    this.headers = {
      'Content-Type': 'text/plain',
      'Connection': 'close',
      'Server': 'Lego-HTTP-Server'
    };
    this.headersSent = false;
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  set(name, value) {
    this.headers[name] = value;
    return this;
  }

  cookie(name, val, options = {}) {
    let str = `${name}=${encodeURIComponent(val)}`;
    if (options.expires) str += `; Expires=${options.expires.toUTCString()}`;
    if (options.maxAge) str += `; Max-Age=${options.maxAge}`;
    if (options.path) str += `; Path=${options.path}`;
    if (options.domain) str += `; Domain=${options.domain}`;
    if (options.secure) str += '; Secure';
    if (options.httpOnly) str += '; HttpOnly';
    
    if (!this.headers['Set-Cookie']) {
      this.headers['Set-Cookie'] = [];
    }
    if (typeof this.headers['Set-Cookie'] === 'string') {
      this.headers['Set-Cookie'] = [this.headers['Set-Cookie']];
    }
    this.headers['Set-Cookie'].push(str);
    return this;
  }

  send(body) {
    if (this.headersSent) return;
    this.headersSent = true;

    let payload = body;
    if (payload === undefined || payload === null) {
      payload = '';
    }

    let buffer;
    if (Buffer.isBuffer(payload)) {
      buffer = payload;
    } else if (typeof payload === 'object') {
      buffer = Buffer.from(JSON.stringify(payload));
      if (!this.headers['Content-Type']) {
        this.headers['Content-Type'] = 'application/json';
      }
    } else {
      buffer = Buffer.from(String(payload));
    }

    this.headers['Content-Length'] = buffer.length;

    // Build HTTP/1.1 response header string block
    const statusMap = {
      200: 'OK',
      201: 'Created',
      204: 'No Content',
      301: 'Moved Permanently',
      302: 'Found',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      500: 'Internal Server Error'
    };
    const statusMsg = statusMap[this.statusCode] || 'Unknown';
    let responseStr = `HTTP/1.1 ${this.statusCode} ${statusMsg}\r\n`;

    for (const [k, v] of Object.entries(this.headers)) {
      if (Array.isArray(v)) {
        for (const val of v) {
          responseStr += `${k}: ${val}\r\n`;
        }
      } else {
        responseStr += `${k}: ${v}\r\n`;
      }
    }
    responseStr += '\r\n';

    this.socket.write(Buffer.concat([Buffer.from(responseStr), buffer]), () => {
      this.socket.end();
    });
  }

  json(obj) {
    this.set('Content-Type', 'application/json');
    this.send(obj);
  }
}

export class HttpServer {
  constructor() {
    this.routes = []; // Array({ method, regex, keys, handlers })
    this.middlewares = [];
    this.server = null;
  }

  use(path, ...handlers) {
    if (typeof path === 'function') {
      this.middlewares.push({ path: '/', handlers: [path, ...handlers] });
    } else {
      this.middlewares.push({ path, handlers });
    }
    return this;
  }

  get(path, ...handlers) { return this._addRoute('GET', path, handlers); }
  post(path, ...handlers) { return this._addRoute('POST', path, handlers); }
  put(path, ...handlers) { return this._addRoute('PUT', path, handlers); }
  delete(path, ...handlers) { return this._addRoute('DELETE', path, handlers); }

  _addRoute(method, path, handlers) {
    const keys = [];
    // Convert parameterized route paths: "/users/:id" -> regex matcher
    const pattern = path
      .replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
        keys.push(name);
        return '([^/]+)';
      })
      .replace(/\//g, '\\/');

    const regex = new RegExp(`^${pattern}$`);
    this.routes.push({ method, regex, keys, handlers });
    return this;
  }

  listen(port, callback) {
    this.server = net.createServer((socket) => {
      let reqBuffer = Buffer.alloc(0);

      socket.on('data', (chunk) => {
        reqBuffer = Buffer.concat([reqBuffer, chunk]);

        // Scan if headers have been fully read (indicated by \r\n\r\n boundary)
        const headerEndIndex = reqBuffer.indexOf('\r\n\r\n');
        if (headerEndIndex !== -1) {
          const headerString = reqBuffer.slice(0, headerEndIndex).toString('utf8');
          const lines = headerString.split('\r\n');
          const requestLine = lines[0].split(' ');
          
          if (requestLine.length < 3) return;
          const method = requestLine[0];
          const url = requestLine[1];

          // Parse Headers
          const headers = {};
          for (let i = 1; i < lines.length; i++) {
            const index = lines[i].indexOf(':');
            if (index !== -1) {
              const name = lines[i].slice(0, index).trim().toLowerCase();
              const value = lines[i].slice(index + 1).trim();
              headers[name] = value;
            }
          }

          const contentLength = parseInt(headers['content-length'] || '0', 10);
          const totalExpectedLength = headerEndIndex + 4 + contentLength;

          // If we have received the full body stream matching Content-Length
          if (reqBuffer.length >= totalExpectedLength) {
            socket.removeAllListeners('data');
            
            const rawBody = reqBuffer.slice(headerEndIndex + 4, totalExpectedLength);
            
            // Construct Request and Response abstractions
            const req = new Request(socket);
            req.method = method.toUpperCase();
            req.url = url;
            req.headers = headers;
            req.rawBody = rawBody;

            // Parse URL path and query parameters
            const urlParts = url.split('?');
            req.path = urlParts[0];
            if (urlParts[1]) {
              for (const pair of urlParts[1].split('&')) {
                const parts = pair.split('=');
                req.query[parts[0]] = decodeURIComponent(parts[1] || '');
              }
            }

            // Parse Cookies
            if (headers['cookie']) {
              for (const pair of headers['cookie'].split(';')) {
                const parts = pair.split('=');
                if (parts[0]) {
                  req.cookies[parts[0].trim()] = decodeURIComponent(parts[1] || '');
                }
              }
            }

            // Parse Body
            if (contentLength > 0) {
              const contentType = headers['content-type'] || '';
              const bodyStr = rawBody.toString('utf8');
              if (contentType.includes('application/json')) {
                try { req.body = JSON.parse(bodyStr); } catch { req.body = bodyStr; }
              } else if (contentType.includes('application/x-www-form-urlencoded')) {
                req.body = {};
                for (const pair of bodyStr.split('&')) {
                  const parts = pair.split('=');
                  req.body[parts[0]] = decodeURIComponent(parts[1] || '');
                }
              } else {
                req.body = bodyStr;
              }
            }

            const res = new Response(socket);
            this._handleRequest(req, res);
          }
        }
      });

      socket.on('error', () => {
        socket.destroy();
      });
    });

    this.server.listen(port, callback);
    return this;
  }

  close(callback) {
    if (this.server) {
      this.server.close(callback);
    }
  }

  _handleRequest(req, res) {
    // Find matching route handler parameters
    let matchedRoute = null;
    for (const route of this.routes) {
      if (route.method === req.method) {
        const match = req.path.match(route.regex);
        if (match) {
          matchedRoute = route;
          // Map URL parameters matching placeholders
          for (let i = 0; i < route.keys.length; i++) {
            req.params[route.keys[i]] = decodeURIComponent(match[i + 1]);
          }
          break;
        }
      }
    }

    // Assemble middleware and handler chain
    const chain = [];

    // 1. Gather global/prefix middleware matches
    for (const mw of this.middlewares) {
      if (req.path.startsWith(mw.path)) {
        chain.push(...mw.handlers);
      }
    }

    // 2. Gather route-specific handlers
    if (matchedRoute) {
      chain.push(...matchedRoute.handlers);
    } else {
      // Fallback 404 Route handler
      chain.push((req, res) => {
        res.status(404).send('Not Found');
      });
    }

    // Execution Loop iterator
    let idx = 0;
    const next = (err) => {
      if (err) {
        res.status(500).send('Internal Server Error');
        return;
      }
      if (idx < chain.length) {
        const currentHandler = chain[idx++];
        try {
          currentHandler(req, res, next);
        } catch (handlerErr) {
          next(handlerErr);
        }
      }
    };

    next();
  }
}
