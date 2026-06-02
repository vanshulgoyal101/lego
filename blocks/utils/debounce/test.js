import { describe, it, expect } from '../../../test/test-harness.js';
import {debounce} from './index.js';

  await describe('utils/debounce', async () => {
    await it('should delay function execution', async () => {
      let counter = 0;
      const fn = debounce(() => { counter++; }, 20);
      fn();
      fn();
      expect(counter).toBe(0);
      await new Promise(resolve => setTimeout(resolve, 30));
      expect(counter).toBe(1);
    });

    await it('should fire immediately if configured', async () => {
      let counter = 0;
      const fn = debounce(() => { counter++; }, 20, { immediate: true });
      fn();
      expect(counter).toBe(1);
    });
  });
