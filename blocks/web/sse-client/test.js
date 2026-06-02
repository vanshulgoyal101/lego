import { describe, it, expect } from '../../../test/test-harness.js';
import {SseClient} from './index.js';

  await describe('web/sse-client', async () => {
    await it('should handle listener additions and comment/data lines parsing', () => {
      const sse = new SseClient('http://localhost/stream');
      let triggered = false;
      sse.addEventListener('custom-event', (e) => {
        triggered = true;
        expect(e.data).toBe('hello world');
      });
      // Feed test lines
      sse._parseLines(['event: custom-event', 'data: hello world', '']);
      expect(triggered).toBe(true);
    });
  });
