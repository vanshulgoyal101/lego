import { describe, it, expect } from '../../../test/test-harness.js';
import {EventEmitter} from './index.js';

  await describe('async/event-emitter', async () => {
    await it('should fire events and once events correctly', async () => {
      const em = new EventEmitter();
      let normalCount = 0;
      let onceCount = 0;

      const handler = () => { normalCount++; };
      em.on('evt', handler);
      em.once('evt', () => { onceCount++; });

      em.emit('evt');
      em.emit('evt');

      expect(normalCount).toBe(2);
      expect(onceCount).toBe(1);

      em.off('evt', handler);
      em.emit('evt');
      expect(normalCount).toBe(2);
    });
  });
