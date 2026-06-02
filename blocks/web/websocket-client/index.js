/**
 * A wrapper around native WebSockets that provides resilience features:
 * - Automatic reconnection with exponential backoff.
 * - Connection heartbeats (pings) to detect silent disconnection.
 * - Outbox buffering (queues messages while offline and sends them when online).
 */
export class ResilientWebSocket {
  /**
   * @param {string} url - WebSocket destination URL.
   * @param {Object} [options={}]
   * @param {number} [options.reconnectInterval=1000] - Base delay before retrying connection.
   * @param {number} [options.maxReconnectInterval=30000] - Max delay before retrying connection.
   * @param {number} [options.heartbeatInterval=30000] - Time between ping heartbeats.
   * @param {WebSocket} [options.WebSocketClass] - Custom WebSocket class (e.g. 'ws' in Node.js).
   */
  constructor(url, options = {}) {
    this.url = url;
    this.reconnectInterval = options.reconnectInterval || 1000;
    this.maxReconnectInterval = options.maxReconnectInterval || 30000;
    this.heartbeatInterval = options.heartbeatInterval || 30000;
    
    // Support Node.js ws dependency injection or browser global WebSocket
    this.WebSocketClass = options.WebSocketClass || (typeof window !== 'undefined' ? window.WebSocket : globalThis.WebSocket);

    this.ws = null;
    this.reconnectAttempts = 0;
    this.listeners = {
      open: [],
      close: [],
      error: [],
      message: []
    };

    this.outboxBuffer = [];
    this.isForcedClose = false;
    
    // Heartbeat timers
    this.heartbeatTimer = null;
    this.heartbeatTimeoutTimer = null;
  }

  /**
   * Initialize the connection.
   */
  connect() {
    this.isForcedClose = false;
    
    if (!this.WebSocketClass) {
      throw new Error('WebSocket class is not available. If in Node.js, pass a WebSocket class implementation.');
    }

    this.ws = new this.WebSocketClass(this.url);

    this.ws.onopen = (event) => {
      this.reconnectAttempts = 0;
      this._startHeartbeat();
      this._flushOutbox();
      this._emit('open', event);
    };

    this.ws.onclose = (event) => {
      this._stopHeartbeat();
      this._emit('close', event);
      
      if (!this.isForcedClose) {
        this._reconnect();
      }
    };

    this.ws.onerror = (event) => {
      this._emit('error', event);
    };

    this.ws.onmessage = (event) => {
      // Refresh heartbeat timer on any activity
      this._startHeartbeat();
      this._emit('message', event);
    };
  }

  /**
   * Register event callbacks.
   */
  addEventListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  /**
   * Send data. If offline, buffers data in local outbox queue.
   * @param {string|ArrayBuffer|Blob} data
   */
  send(data) {
    if (this.ws && this.ws.readyState === this.WebSocketClass.OPEN) {
      this.ws.send(data);
    } else {
      this.outboxBuffer.push(data);
    }
  }

  /**
   * Force close the connection permanently.
   */
  close() {
    this.isForcedClose = true;
    this._stopHeartbeat();
    if (this.ws) {
      this.ws.close();
    }
  }

  /**
   * Internal emitter.
   * @private
   */
  _emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  /**
   * Reconnect scheduler with backoff.
   * @private
   */
  _reconnect() {
    const delay = Math.min(
      this.reconnectInterval * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectInterval
    );
    this.reconnectAttempts++;

    setTimeout(() => {
      console.log(`Reconnecting to WebSocket (attempt ${this.reconnectAttempts})...`);
      this.connect();
    }, delay);
  }

  /**
   * Clear out queue once connection is restored.
   * @private
   */
  _flushOutbox() {
    while (this.outboxBuffer.length > 0 && this.ws.readyState === this.WebSocketClass.OPEN) {
      const data = this.outboxBuffer.shift();
      this.ws.send(data);
    }
  }

  /**
   * Initialize connection liveness tests.
   * @private
   */
  _startHeartbeat() {
    this._stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === this.WebSocketClass.OPEN) {
        // Send a ping message. Expects any response (message or pong) to keep link alive
        this.ws.send(JSON.stringify({ type: 'ping' }));

        // If no message returns within 8 seconds, assume link dead
        this.heartbeatTimeoutTimer = setTimeout(() => {
          console.warn('WebSocket heartbeat timeout. Closing socket.');
          this.ws.close();
        }, 8000);
      }
    }, this.heartbeatInterval);
  }

  /**
   * Clear heartbeat timers.
   * @private
   */
  _stopHeartbeat() {
    clearInterval(this.heartbeatTimer);
    clearTimeout(this.heartbeatTimeoutTimer);
  }
}
