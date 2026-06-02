/**
 * Universal Server-Sent Events client supporting custom headers, request body,
 * and auto-reconnection with backoff.
 */
export class SseClient {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
    this.headers = options.headers || {};
    this.method = options.method || 'GET';
    this.body = options.body || null;
    this.reconnectInterval = options.reconnectInterval || 1000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
    
    this.listeners = new Map();
    this.controller = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.lastEventId = '';
  }

  addEventListener(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(listener);
  }

  removeEventListener(event, listener) {
    if (!this.listeners.has(event)) return;
    const list = this.listeners.get(event);
    const index = list.indexOf(listener);
    if (index !== -1) {
      list.splice(index, 1);
    }
  }

  dispatchEvent(event, data) {
    const list = this.listeners.get(event);
    if (list) {
      for (const listener of list) {
        try {
          listener({ type: event, data, lastEventId: this.lastEventId });
        } catch (err) {
          console.error(`Error in SSE listener for event "${event}":`, err);
        }
      }
    }
  }

  async connect() {
    if (this.isConnected) return;
    this.controller = new AbortController();

    const headers = {
      'Accept': 'text/event-stream',
      ...this.headers,
    };
    if (this.lastEventId) {
      headers['Last-Event-ID'] = this.lastEventId;
    }

    try {
      const response = await fetch(this.url, {
        method: this.method,
        headers,
        body: this.body,
        signal: this.controller.signal
      });

      if (!response.ok) {
        throw new Error(`SSE HTTP error: ${response.status} ${response.statusText}`);
      }

      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.dispatchEvent('open', '');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r\n|\r|\n/);
        
        // Keep the last partial line in the buffer
        buffer = lines.pop() || '';

        this._parseLines(lines);
      }

      // Stream ended naturally
      this.isConnected = false;
      this.dispatchEvent('close', 'Stream ended');
    } catch (err) {
      this.isConnected = false;
      this.dispatchEvent('error', err.message);
      
      if (err.name !== 'AbortError') {
        this._attemptReconnect();
      }
    }
  }

  disconnect() {
    if (this.controller) {
      this.controller.abort();
    }
    this.isConnected = false;
    this.dispatchEvent('close', 'User disconnected');
  }

  _parseLines(lines) {
    let currentEvent = 'message';
    let currentData = '';

    for (const line of lines) {
      if (!line.trim()) {
        // Empty line signifies end of message block
        if (currentData) {
          this.dispatchEvent(currentEvent, currentData.trim());
          currentData = '';
        }
        currentEvent = 'message';
        continue;
      }

      if (line.startsWith(':')) {
        // SSE Comment
        continue;
      }

      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) {
        // Line with field name only
        this._processField(line, '', currentEvent, (e) => currentEvent = e, (d) => currentData += d);
      } else {
        const field = line.slice(0, colonIndex);
        let value = line.slice(colonIndex + 1);
        if (value.startsWith(' ')) {
          value = value.slice(1);
        }
        this._processField(field, value, currentEvent, (e) => currentEvent = e, (d) => currentData += d);
      }
    }
  }

  _processField(field, value, currentEvent, setEvent, appendData) {
    switch (field) {
      case 'event':
        setEvent(value);
        break;
      case 'data':
        appendData(value + '\n');
        break;
      case 'id':
        this.lastEventId = value;
        break;
      case 'retry':
        const r = parseInt(value, 10);
        if (!isNaN(r)) {
          this.reconnectInterval = r;
        }
        break;
    }
  }

  _attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.dispatchEvent('error', 'Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }
}
