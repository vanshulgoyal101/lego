import { describe, it, expect } from '../../../test/test-harness.js';
import {ResilientWebSocket} from './index.js';

  await describe('web/websocket-client', async () => {
    await it('should buffer outgoing items while offline', async () => {
      class MockWS {
        constructor(url) {
          this.url = url;
          this.readyState = 0;
        }
      }
      const client = new ResilientWebSocket('ws://localhost:1234', { WebSocketClass: MockWS });
      client.connect();
      client.send('hello-buffered');
      expect(client.outboxBuffer.length).toBe(1);
      expect(client.outboxBuffer[0]).toBe('hello-buffered');
    });
  });
