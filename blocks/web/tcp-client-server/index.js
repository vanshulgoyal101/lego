import net from 'net';

/**
 * Promise-based TCP Server wrapper
 */
export class TCPServer {
  constructor() {
    this.server = null;
    this.connections = new Set();
  }

  /**
   * Start the TCP server listening on a port
   *
   * @param {number} port
   * @param {Function} onDataCallback - Callback when client sends data: (socket, data) => {}
   * @param {Function} [onConnectCallback] - Callback when client connects: (socket) => {}
   * @returns {Promise<Object>} Server address structure
   */
  start(port, onDataCallback, onConnectCallback) {
    return new Promise((resolve, reject) => {
      this.server = net.createServer((socket) => {
        this.connections.add(socket);
        if (onConnectCallback) onConnectCallback(socket);

        socket.on('data', (data) => {
          if (onDataCallback) onDataCallback(socket, data);
        });

        socket.on('close', () => {
          this.connections.delete(socket);
        });

        socket.on('error', () => {
          this.connections.delete(socket);
        });
      });

      this.server.listen(port, '127.0.0.1', () => {
        resolve(this.server.address());
      });

      this.server.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Send data to all active clients
   * @param {string|Buffer} data
   */
  broadcast(data) {
    for (const socket of this.connections) {
      if (!socket.destroyed) {
        socket.write(data);
      }
    }
  }

  /**
   * Stop the server and close all client connections
   */
  stop() {
    return new Promise((resolve) => {
      for (const socket of this.connections) {
        socket.destroy();
      }
      this.connections.clear();
      if (this.server) {
        this.server.close(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

/**
 * Promise-based TCP Client wrapper
 */
export class TCPClient {
  constructor() {
    this.socket = null;
  }

  /**
   * Connect to a remote TCP host/port
   *
   * @param {number} port
   * @param {string} [host='127.0.0.1']
   */
  connect(port, host = '127.0.0.1') {
    return new Promise((resolve, reject) => {
      this.socket = net.createConnection({ port, host }, () => {
        resolve();
      });

      this.socket.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Write data to socket
   * @param {string|Buffer} data
   */
  write(data) {
    if (!this.socket) throw new Error('NotConnected: Call connect() first.');
    return new Promise((resolve, reject) => {
      this.socket.write(data, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * Register data receive listener
   * @param {Function} cb - (data) => {}
   */
  onData(cb) {
    if (!this.socket) throw new Error('NotConnected: Call connect() first.');
    this.socket.on('data', cb);
  }

  /**
   * Close client connection
   */
  close() {
    if (this.socket) {
      this.socket.end();
      this.socket.destroy();
    }
  }
}
