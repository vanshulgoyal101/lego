import { describe, it, expect } from '../../../test/test-harness.js';
import {retry} from './index.js';

  await describe('utils/retry', async () => {
    await it('should retry tasks upon failure', async () => {
      let count = 0;
      const task = async () => {
        count++;
        if (count < 3) throw new Error('fail');
        return 'OK';
      };
      const res = await retry(task, { retries: 3, delay: 5 });
      expect(res).toBe('OK');
      expect(count).toBe(3);
    });
  });
